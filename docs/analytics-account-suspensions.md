# Analytics account suspensions

Analytics exposes two application entities:

-   `AccountSuspension` is a mutable suspension period for one Core and one address.
    An unsuspend closes the period; a later suspend creates a new row. Closed
    periods and their withdrawals remain available.
-   `SuspendedWithdrawal` is an immutable record of each `WithdrawSuspendedUser`
    event, linked through `suspension`. It includes the exact amount, admin,
    recipient, transaction, timestamp, block number, and block-global log index.

`AccountSuspensionLookup` is an internal mapping helper keyed by lowercase
`<Core>-<user>`. It points to the latest period so unsuspend and withdrawal events
can find it. Applications should query the two entities above.

## Period lifecycle

| Event                               | Result                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Suspend while no period is open     | Create a new period, using transaction hash plus log index as its ID.                               |
| Suspend while already suspended     | Keep the open period and its original start; update `updateTimestamp`.                              |
| Withdraw suspended funds            | Create an individual withdrawal and add its amount to the open period's `withdrawnSuspendedAmount`. |
| Unsuspend                           | Close the open period and record its unsuspend transaction, timestamp, block, and log index.        |
| Unsuspend while already unsuspended | Keep the previous end and update `updateTimestamp`.                                                 |
| Suspend after unsuspending          | Create a new period with zero withdrawn amount; keep the previous period unchanged.                 |

Each Core/address pair is independent. Parent accounts, child virtual accounts,
and deleted profiles are not combined or excluded. No Account or profile row is
required. Same-block and same-transaction events are processed in log order.

If the first observed event is an unsuspend, a closed period records that end
with null start fields. If a suspended withdrawal has no open period, a warning
is logged and an open period with null start fields is created: the contract
requires the user to be suspended for this withdrawal. A later repeated suspend
does not recover the unknown earlier start. These partial periods preserve
observed evidence; they do not imply complete historical coverage.

## Amounts

`withdrawnSuspendedAmount` is the accumulated amount **for that period**. For the
Core/address lifetime total, sum this field across every period, or sum all
`SuspendedWithdrawal.amount` records filtered by Core and user. Use integer
arithmetic; GraphQL returns BigInt values as strings.

Amounts retain the collateral token's native smallest units. These events move
internal Core balance from the suspended user to the recipient; they do not
represent ERC-20 payouts from Core. The accompanying `Withdraw` event is not
added again, and `DeallocateSuspendedUser` is not counted as a withdrawal.

## Queries

Read root `_meta { block { number } hasIndexingErrors }` first. Pin every page
to that indexed block and advance `$after` from the final returned ID until a
page is shorter than `$first`. An empty cursor starts the first page. Treat
errors, unavailable schemas, or indexing failures as unavailable, not zero.

```graphql
query SuspendedUsers($source: Bytes!, $block: Int!, $after: ID!, $first: Int!) {
	accountSuspensions(
		block: { number: $block }
		first: $first
		orderBy: id
		orderDirection: asc
		where: { source: $source, isSuspended: true, id_gt: $after }
	) {
		id
		source
		user
		suspendTimestamp
		suspendTransaction
		withdrawnSuspendedAmount
	}
}
```

There is at most one open period per Core/user. To retrieve all periods for an
address, filter `accountSuspensions` by `source` and `user`, omitting
`isSuspended`. IDs are pagination keys, not chronological ordering values; use
the block numbers and log indexes to order history for display.

`AccountSuspension.withdrawals` is a derived relation. Explicitly paginate it,
or query withdrawals at the root to avoid a nested relation's default page cap:

```graphql
query PeriodWithdrawals($period: String!, $block: Int!, $after: ID!, $first: Int!) {
	suspendedWithdrawals(block: { number: $block }, first: $first, orderBy: id, orderDirection: asc, where: { suspension: $period, id_gt: $after }) {
		id
		suspension {
			id
		}
		amount
		admin
		recipient
		transactionHash
		blockTimestamp
		blockNumber
		logIndex
	}
}
```

## Version coverage and rollout

`SetSuspendedAddress` is wired for Core 0.8.0 through 0.8.6.
`WithdrawSuspendedUser` exists only from 0.8.5 and is inherited by 0.8.6.
Periods remain linked across ABI upgrades when the emitting Core address stays
the same. Existing analytics types and raw Events mappings are unchanged.

These entities require replay from the relevant contract history. Grafting
after historical suspension events without seeding periods and lookups does
not backfill them. Before a frontend cutover, compare the exact active address
set with raw Events at the same indexed block and check representative states
against Core. Indexer observations are not a guarantee of current chain-head
state. This source change does not deploy, resume, or promote any subgraph.
