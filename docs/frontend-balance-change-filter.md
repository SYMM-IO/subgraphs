# Filtering virtual-account bookkeeping from `BalanceChange` queries

## TL;DR

A user-facing "Transactions" list built from the `perps/analytics` subgraph's
`BalanceChange` entity is leaking internal virtual-account (VA) margin moves
that the user never authorized. Two new nullable fields on `BalanceChange`
make these filterable at query time:

- `sender: Bytes` — the raw emitter address from the underlying `Deposit` /
  `Withdraw` event.
- `senderRef: Account` — the same address resolved as an `Account` relation,
  so you can filter on `senderRef_.isVirtual`.

Both fields are populated from the subgraph version shipping this change
onward. They are `null` for:
- Rows indexed before this version (older deployments).
- `BalanceChange` rows derived from events that have no `sender` param
  (`AllocatePartyA`, `DeallocatePartyA`, `BalanceChangePartyA`,
  `BalanceChangePartyB`, `AllocateForPartyB`, `DeallocateForPartyB`,
  `TransferToBridge`, `DepositForPartyB`).

## Why this change exists

When a user opens a position through the AccountLayer, the protocol creates a
per-position "virtual account" (VA) under the user's sub-account and moves
margin between them automatically. On close, it moves margin back. These
internal transfers surface as on-chain `Deposit` and `Withdraw` events:

- **Open** (`addMargin` / `addMarginToNextVA`): a `Withdraw` fires with
  `account = VA`. Already filterable via the existing `Account.isVirtual`
  flag on the VA.
- **Close** (`removeMargin`): a `Deposit` fires with **`account = sub-account`
  and `sender = VA`**. The sub-account is user-visible, and the event's
  `isVirtual` flag is `false`, so nothing in the row itself flags it as
  internal. Only `sender` reveals it.

That close-side `Deposit` is what was leaking into the user's transaction
history. The new `senderRef` field lets you filter on `sender.isVirtual`.

## The query

**Step 1 — resolve the user's real (non-virtual) accounts:**

```graphql
query UserAccounts($user: Bytes!) {
  accounts(where: { user: $user, isVirtual: false }) {
    id
  }
}
```

Typical users have 1–3 sub-accounts. Cache this result for the session.

**Step 2 — fetch balance changes, excluding VA-internal rows:**

```graphql
query UserTxs($accounts: [Bytes!]!) {
  balanceChanges(
    where: {
      account_in: $accounts
      or: [
        { senderRef: null }
        { senderRef_: { isVirtual_not: true } }
      ]
      type_in: ["DEPOSIT", "WITHDRAW"]
    }
    orderBy: timestamp
    orderDirection: desc
    first: 50
  ) {
    id
    type
    amount
    account
    sender
    timestamp
    transaction
    collateral
  }
}
```

## Why the `or` branch

Two cases must stay visible but need different predicates:

1. `senderRef: null` — rows where the subgraph didn't record a sender: either
   the event has no sender param, or the row was indexed before this version.
   These are never VA-internal, so keep them.
2. `senderRef_: { isVirtual_not: true }` — rows where the sender is a known
   address and is **not** a virtual account (EOA, MultiAccount, sub-account,
   legitimate virtual provider, etc.). Keep these.

The only rows excluded are those where `senderRef` resolves to an `Account`
entity with `isVirtual: true` — i.e., exactly the VA-internal bookkeeping.

**Note**: use `isVirtual_not: true` rather than `isVirtual: false`. An
`Account` created as type `UNKNOWN` (common for EOAs first seen as deposit
senders) has `isVirtual = null`, not `false`. `isVirtual_not: true` matches
both `null` and `false`; `isVirtual: false` would drop the EOA rows.

## What stays visible (correct behavior)

- **Real user deposit** (`deposit`, `depositFor`, `depositAndAllocate`):
  `sender` is an EOA or MultiAccount contract; `senderRef.isVirtual != true`
  → kept.
- **Real withdrawal** (`withdraw`, `withdrawTo`): `sender` is the sub-account;
  `senderRef.isVirtual == false` → kept.
- **Bridge transfer** (`type: "BRIDGE"`): `senderRef = null` (event has no
  sender) → kept.
- **Virtual provider express deposit** (`virtualDepositFor`): `sender` is
  the virtual provider address, not a VA → kept. These are real value
  deliveries to the user even though the event's `isVirtual` flag is `true`.
- **Admin-initiated suspended-user moves** (`withdrawSuspendedUser`): `sender`
  is the suspended sub-account, `isVirtual != true` → kept.

## What gets filtered out

- **Close-flow internal deposit** from `internalTransferToBalance`: `sender`
  is the VA, `senderRef.isVirtual == true` → **filtered**. This is the
  primary leak this change addresses.
- **Emergency margin recovery** from `emergencyRecoverMargin`: same shape;
  the lost VA is retroactively tagged `isVirtual = true` by the handler
  → **filtered**.

## Deployment

- **New deployment/tag**: ships the schema change and populates new fields
  from the start block. Use this tag for the filtered query pattern above.
- **Old deployment/tag**: unchanged. Existing consumers continue to work
  against the prior schema. Queries that use the new fields against the old
  tag will error — pin each client to the tag it expects.

Ask the subgraph owner for the exact new tag URL when migrating.

## Gotchas

- `BalanceChangePartyA` / `BalanceChangePartyB` rows (types like `CVA_IN`,
  `LF_OUT`, funding, `REALIZED_PNL_*`) are internal protocol accounting, not
  user transactions. Keep them out of a transactions UI with a `type_in`
  allowlist such as `["DEPOSIT", "WITHDRAW", "BRIDGE"]` (plus `ALLOCATE` /
  `DEALLOCATE` if you show them). The VA filter is orthogonal to this.
- On `removeMargin`, two rows are emitted: a VA-side `Withdraw` (filtered by
  `account_in` since the VA is not in the user's sub-account list) and a
  sub-account-side `Deposit` (filtered by `senderRef`). Both must be excluded
  for the transactions list to be clean — the query above handles both.
- `sideAccount` / `sideAccountRef` are not affected by this change. They
  remain populated only for partyB bilateral events.
