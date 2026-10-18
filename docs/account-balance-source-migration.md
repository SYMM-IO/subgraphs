# Account balance source migration

## Breaking schema change

`SubAccount.latestMarginBalance` and `VirtualAccount.latestMarginBalance` have been removed. Remove these selections from all client queries before switching to the new subgraph deployment. Deploy the updated clients first; their queries also work against the previous schema. Build and deploy a new subgraph version using the normal release process; local source changes do not update an existing deployment.

The removed fields were event accumulators, not contract views. The sub-account counter added `AddMargin.amount` and subtracted `RemoveMargin.amount` and `EmergencyMarginRecovered.amount`. The virtual-account counter applied add/remove events only when the entity existed; it could miss pre-creation adds and did not reconcile emergency recovery or reuse. Neither represented collateral after trading PnL, funding, fees, or all core balance movements. Repeated margin flows could produce a large positive counter even when little collateral remained.

## Replacement

Read the root `LatestAccountBalance` entity, filtered by the SYMMIO **core** `source`, `account`, and `accountType: "PARTY_A"` for trader accounts. Do not use the AccountLayer address as the core source and do not put a replacement balance under `SubAccount` or `VirtualAccount`.

```graphql
query AccountBalance($source: Bytes!, $account: Bytes!) {
	latestAccountBalances(where: { source: $source, account: $account, accountType: "PARTY_A" }, first: 1) {
		account
		source
		freeBalance
		allocatedBalance
		totalBalance
		timestamp
		blockNumber
	}
}
```

`freeBalance` comes from `balanceOf`; allocated and locked amounts come from the balance-info getter. Amounts use the core's 18-decimal internal units. `totalBalance = freeBalance + allocatedBalance`; locked and pending locked amounts are components of allocated, not additional collateral. These are indexed snapshots, not live reads when a client requests the page. Failed view calls retain prior state; periodic reconciliation can repair stale snapshots. Zero PartyA rows may be removed, so an absent row is not proof of a successful current zero read.

For owner totals, include separately held virtual-account balances as well as parent and legacy accounts. Deduplicate by chain, core and account. `accountRef_: { user: $owner }` limits the query to indexed ownership and is not a guarantee of wallet-wide discovery. Paginate the result. Do not include PartyB buckets in a PartyA total.

## Preserved behavior

Margin events still write `MarginTransfer`, update activity timestamps and applicable hierarchy histories, and refresh the parent and virtual account's `LatestAccountBalance` through the existing view-call path. Position tracking, margin-transfer history and contract reads do not depend on the removed counter. No replacement counter or new on-chain call is introduced by this removal.
