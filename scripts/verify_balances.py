# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "web3>=6.0",
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
        [--type PartyA|PartyB]
"""

import argparse
import sys
import time

import requests
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


def fetch_entities(subgraph_url, account_type=None, limit=None):
    """Paginate through all LatestAccountBalance entities."""
    entities = []
    last_id = ""
    page_size = 100

    while True:
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

        resp = requests.post(subgraph_url, json={"query": query}, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        if "errors" in data:
            print(f"GraphQL errors: {data['errors']}")
            sys.exit(1)

        batch = data["data"]["latestAccountBalances"]
        if not batch:
            break

        entities.extend(batch)
        last_id = batch[-1]["id"]

        if limit and len(entities) >= limit:
            entities = entities[:limit]
            break

    return entities


def verify_entity(w3, entity):
    """Compare a single entity against on-chain state. Returns (passed, mismatches)."""
    contract_addr = Web3.to_checksum_address(entity["source"])
    account = Web3.to_checksum_address(entity["account"])
    block_number = int(entity["blockNumber"])
    account_type = entity["accountType"]

    if account_type == "PARTY_A":
        selector = w3.keccak(text=BALANCE_INFO_PARTY_A_SIG)[:4]
        encoded_args = encode(["address"], [account])
        call_data = selector + encoded_args
    else:
        counter_party = Web3.to_checksum_address(entity["counterParty"])
        selector = w3.keccak(text=BALANCE_INFO_PARTY_B_SIG)[:4]
        # Contract signature: balanceInfoOfPartyB(partyB, partyA)
        # entity.account = partyB, entity.counterParty = partyA
        encoded_args = encode(["address", "address"], [account, counter_party])
        call_data = selector + encoded_args

    max_retries = 5
    for attempt in range(max_retries):
        try:
            raw_result = w3.eth.call(
                {"to": contract_addr, "data": call_data},
                block_identifier=block_number,
            )
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                wait = 2 ** attempt
                time.sleep(wait)
                continue
            return False, [{"field": "rpc_call", "subgraph": "N/A", "onchain": f"ERROR: {e}"}]

    on_chain_values = decode(RETURN_TYPE, raw_result)

    mismatches = []
    for i, field in enumerate(BALANCE_FIELDS):
        subgraph_val = int(entity[field])
        on_chain_val = on_chain_values[i]
        if subgraph_val != on_chain_val:
            mismatches.append({"field": field, "subgraph": str(subgraph_val), "onchain": str(on_chain_val)})

    return len(mismatches) == 0, mismatches


def main():
    parser = argparse.ArgumentParser(description="Verify LatestAccountBalance entities against on-chain state")
    parser.add_argument("--subgraph-url", required=True, help="Subgraph GraphQL endpoint URL")
    parser.add_argument("--rpc-url", required=True, help="RPC endpoint URL for on-chain calls")
    parser.add_argument("--limit", type=int, default=None, help="Only check first N entities")
    parser.add_argument("--type", dest="account_type", choices=["PartyA", "PartyB"], default=None, help="Only check PartyA or PartyB entities")
    args = parser.parse_args()

    account_type_filter = None
    if args.account_type == "PartyA":
        account_type_filter = "PARTY_A"
    elif args.account_type == "PartyB":
        account_type_filter = "PARTY_B"

    print(f"Fetching entities from subgraph...")
    entities = fetch_entities(args.subgraph_url, account_type=account_type_filter, limit=args.limit)
    print(f"Found {len(entities)} entities to verify\n")

    if not entities:
        print("No entities found.")
        return

    w3 = Web3(Web3.HTTPProvider(args.rpc_url))
    if not w3.is_connected():
        print(f"ERROR: Cannot connect to RPC at {args.rpc_url}")
        sys.exit(1)

    passed = 0
    failed = 0

    for i, entity in enumerate(entities):
        entity_id = entity["id"]
        ok, mismatches = verify_entity(w3, entity)

        if ok:
            passed += 1
            print(f"[{i + 1}/{len(entities)}] PASS  {entity_id}")
        else:
            failed += 1
            print(f"[{i + 1}/{len(entities)}] FAIL  {entity_id}")
            for m in mismatches:
                print(f"         {m['field']}: subgraph={m['subgraph']}  on-chain={m['onchain']}")

    print(f"\n{'=' * 60}")
    print(f"Results: {passed} passed, {failed} failed, {passed + failed} total")
    if failed == 0:
        print("All entities match on-chain state!")
    else:
        print(f"WARNING: {failed} entities have mismatches")
        sys.exit(1)


if __name__ == "__main__":
    main()
