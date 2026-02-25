# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "web3>=6.0",
#     "aiohttp",
#     "requests",
# ]
# ///
"""
Verify LatestAccountBalance subgraph entities against on-chain contract state.

Usage:
    uv run scripts/verify_balances.py \
        --subgraph-url <url> \
        --rpc-url <url> \
        [--limit N] \
        [--type PartyA|PartyB] \
        [--concurrency 10]
"""

import argparse
import asyncio
import sys
import time

import aiohttp
from eth_abi import decode, encode
from web3 import Web3

BALANCE_FIELDS = [
    "allocatedBalance",
    "lockedCva",
    "lockedLf",
    "lockedPartyAmm",
    "lockedPartyBmm",
    "pendingLockedCva",
    "pendingLockedLf",
    "pendingLockedPartyAmm",
    "pendingLockedPartyBmm",
]

BALANCE_INFO_PARTY_A_SIG = "balanceInfoOfPartyA(address)"
BALANCE_INFO_PARTY_B_SIG = "balanceInfoOfPartyB(address,address)"

RETURN_TYPE = ["uint256"] * 9

SELECTOR_A = Web3.keccak(text=BALANCE_INFO_PARTY_A_SIG)[:4]
SELECTOR_B = Web3.keccak(text=BALANCE_INFO_PARTY_B_SIG)[:4]

# ANSI colors
GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
CYAN = "\033[36m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"


def short_addr(addr):
    """Shorten an address to 0x1234...abcd"""
    return addr[:6] + "..." + addr[-4:]


async def fetch_entities(session, subgraph_url, account_type=None, limit=None):
    """Paginate through all LatestAccountBalance entities."""
    entities = []
    last_id = ""
    page_size = 100
    page = 0

    while True:
        page += 1
        type_filter = f', accountType: "{account_type}"' if account_type else ""
        query = """
        {
            latestAccountBalances(
                first: %d,
                where: { id_gt: "%s"%s },
                orderBy: id,
                orderDirection: asc
            ) {
                id
                source
                account
                counterParty
                accountType
                allocatedBalance
                lockedCva
                lockedLf
                lockedPartyAmm
                lockedPartyBmm
                pendingLockedCva
                pendingLockedLf
                pendingLockedPartyAmm
                pendingLockedPartyBmm
                blockNumber
            }
        }
        """ % (page_size, last_id, type_filter)

        async with session.post(subgraph_url, json={"query": query}) as resp:
            resp.raise_for_status()
            data = await resp.json()

        if "errors" in data:
            print(f"{RED}GraphQL errors: {data['errors']}{RESET}")
            sys.exit(1)

        batch = data["data"]["latestAccountBalances"]
        if not batch:
            break

        entities.extend(batch)
        last_id = batch[-1]["id"]
        print(f"  page {page}: fetched {len(batch)} entities ({len(entities)} total)")

        if limit and len(entities) >= limit:
            entities = entities[:limit]
            break

    return entities


def build_call_data(entity):
    """Build the eth_call data for an entity."""
    account = Web3.to_checksum_address(entity["account"])

    if entity["accountType"] == "PARTY_A":
        return SELECTOR_A + encode(["address"], [account])
    else:
        counter_party = Web3.to_checksum_address(entity["counterParty"])
        # Contract signature: balanceInfoOfPartyB(partyB, partyA)
        # entity.account = partyB, entity.counterParty = partyA
        return SELECTOR_B + encode(["address", "address"], [account, counter_party])


async def rpc_call(session, rpc_url, contract_addr, call_data, block_number):
    """Make an eth_call via JSON-RPC with retry on 429."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_call",
        "params": [
            {"to": contract_addr, "data": "0x" + call_data.hex()},
            hex(block_number),
        ],
    }

    max_retries = 5
    for attempt in range(max_retries):
        async with session.post(rpc_url, json=payload) as resp:
            if resp.status == 429:
                if attempt < max_retries - 1:
                    wait = 2**attempt
                    print(f"  {YELLOW}rate limited, retrying in {wait}s...{RESET}")
                    await asyncio.sleep(wait)
                    continue
                return None, "429 Too Many Requests (max retries exceeded)"
            resp.raise_for_status()
            data = await resp.json()

        if "error" in data:
            return None, data["error"].get("message", str(data["error"]))
        return bytes.fromhex(data["result"][2:]), None

    return None, "max retries exceeded"


async def verify_entity(session, rpc_url, entity, counter):
    """Compare a single entity against on-chain state."""
    entity_id = entity["id"]
    contract_addr = Web3.to_checksum_address(entity["source"])
    block_number = int(entity["blockNumber"])
    account_type = entity["accountType"]
    call_data = build_call_data(entity)

    raw_result, err = await rpc_call(session, rpc_url, contract_addr, call_data, block_number)
    if err:
        return entity_id, False, [{"field": "rpc_call", "subgraph": "N/A", "onchain": f"ERROR: {err}"}], account_type, block_number

    on_chain_values = decode(RETURN_TYPE, raw_result)

    mismatches = []
    for i, field in enumerate(BALANCE_FIELDS):
        subgraph_val = int(entity[field])
        on_chain_val = on_chain_values[i]
        if subgraph_val != on_chain_val:
            mismatches.append({"field": field, "subgraph": str(subgraph_val), "onchain": str(on_chain_val)})

    return entity_id, len(mismatches) == 0, mismatches, account_type, block_number


async def main():
    parser = argparse.ArgumentParser(description="Verify LatestAccountBalance entities against on-chain state")
    parser.add_argument("--subgraph-url", required=True, help="Subgraph GraphQL endpoint URL")
    parser.add_argument("--rpc-url", required=True, help="RPC endpoint URL for on-chain calls")
    parser.add_argument("--limit", type=int, default=None, help="Only check first N entities")
    parser.add_argument("--type", dest="account_type", choices=["PartyA", "PartyB"], default=None, help="Only check PartyA or PartyB entities")
    parser.add_argument("--concurrency", type=int, default=10, help="Max concurrent RPC calls (default: 10)")
    args = parser.parse_args()

    account_type_filter = None
    if args.account_type == "PartyA":
        account_type_filter = "PARTY_A"
    elif args.account_type == "PartyB":
        account_type_filter = "PARTY_B"

    print(f"\n{BOLD}LatestAccountBalance Verification{RESET}")
    print(f"{'─' * 50}")
    print(f"  Subgraph:    {DIM}{args.subgraph_url}{RESET}")
    print(f"  RPC:         {DIM}{args.rpc_url}{RESET}")
    print(f"  Concurrency: {args.concurrency}")
    if args.limit:
        print(f"  Limit:       {args.limit}")
    if args.account_type:
        print(f"  Filter:      {args.account_type} only")
    print()

    async with aiohttp.ClientSession() as session:
        print(f"{CYAN}[1/2] Fetching entities from subgraph...{RESET}")
        t0 = time.time()
        entities = await fetch_entities(session, args.subgraph_url, account_type=account_type_filter, limit=args.limit)
        fetch_time = time.time() - t0

        if not entities:
            print(f"\n{YELLOW}No entities found.{RESET}")
            return

        party_a_count = sum(1 for e in entities if e["accountType"] == "PARTY_A")
        party_b_count = sum(1 for e in entities if e["accountType"] == "PARTY_B")
        print(f"  found {BOLD}{len(entities)}{RESET} entities ({party_a_count} PartyA, {party_b_count} PartyB) in {fetch_time:.1f}s\n")

        print(f"{CYAN}[2/2] Verifying against on-chain state...{RESET}")
        t0 = time.time()

        semaphore = asyncio.Semaphore(args.concurrency)
        counter = {"done": 0, "total": len(entities)}

        async def bounded_verify(entity):
            async with semaphore:
                result = await verify_entity(session, args.rpc_url, entity, counter)
                counter["done"] += 1
                return result

        results = await asyncio.gather(*(bounded_verify(e) for e in entities))
        verify_time = time.time() - t0

    print()
    passed = 0
    failed = 0
    total = len(results)

    for i, (entity_id, ok, mismatches, account_type, block_number) in enumerate(results):
        parts = entity_id.split("-")
        if account_type == "PARTY_A":
            label = f"PartyA {short_addr(parts[0])} @ {short_addr(parts[1])}"
        else:
            label = f"PartyB {short_addr(parts[0])} <> {short_addr(parts[1])} @ {short_addr(parts[2])}"

        if ok:
            passed += 1
            print(f"  {GREEN}PASS{RESET}  {label}  {DIM}block {block_number}{RESET}")
        else:
            failed += 1
            is_rpc_error = mismatches and mismatches[0]["field"] == "rpc_call"
            if is_rpc_error:
                print(f"  {YELLOW}SKIP{RESET}  {label}  {DIM}block {block_number}{RESET}")
                print(f"        {YELLOW}{mismatches[0]['onchain']}{RESET}")
            else:
                print(f"  {RED}FAIL{RESET}  {label}  {DIM}block {block_number}{RESET}")
                for m in mismatches:
                    print(f"        {RED}{m['field']}{RESET}: subgraph={m['subgraph']}  on-chain={m['onchain']}")

    print(f"\n{'━' * 50}")
    print(f"{BOLD}Results{RESET}: {GREEN}{passed} passed{RESET}, {RED if failed else DIM}{failed} failed{RESET} / {total} total")
    print(f"{DIM}Completed in {fetch_time + verify_time:.1f}s (fetch {fetch_time:.1f}s + verify {verify_time:.1f}s){RESET}")

    if failed == 0:
        print(f"{GREEN}{BOLD}All entities match on-chain state!{RESET}\n")
    else:
        print(f"{RED}WARNING: {failed} entities have mismatches{RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
