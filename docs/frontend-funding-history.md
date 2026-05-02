# Funding History UI in SYMMIO 0.8.5

## Summary

Funding history in SYMMIO 0.8.5 is an index-based ledger, not a list of on-chain per-epoch payment events.

The frontend should render two kinds of rows:

-   **Virtual accrual rows**: one row per completed funding epoch while the quote was open. These rows are reconstructed from funding index checkpoints.
-   **Settlement rows**: on-chain moments where accrued funding was realized for the quote. These are indexed by the subgraph as `QuoteFundingSettlement`.

The important distinction:

-   A completed epoch can create funding debt without moving balances.
-   A charge or close realizes that debt and moves allocated balances, except for liquidation-specific flows.

## User-Facing Statuses

Use these statuses for virtual epoch rows:

| Status                           | Meaning                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `UNPAID_DEBT`                    | PartyA owes funding for this completed epoch, but it has not been charged from allocated balance yet.            |
| `UNPAID_RECEIVABLE`              | PartyA should receive funding for this completed epoch, but it has not been credited yet.                        |
| `PAID`                           | This epoch is covered by a `QuoteFundingSettlement` with `balanceChanged = true`.                                |
| `SETTLED_WITHOUT_BALANCE_CHANGE` | This epoch was handled by a liquidation or clearing-house sync flow, not a normal balance-moving funding charge. |
| `NOT_ACCRUED`                    | Optional: current incomplete epoch. Usually hide this from the main table.                                       |

For most quote history tables, show only completed epochs.

## Subgraph Entities

### `FundingIndexCheckpoint`

Immutable checkpoint emitted by the analytics subgraph when the funding index changes for `(symbolId, partyB)`.

Use it to reconstruct which funding rate applied during each epoch.

Key fields:

```graphql
fundingIndexCheckpoints(
  where: {
    source: "0x..."
    symbolId: "1"
    partyB: "0x..."
  }
  orderBy: timestamp
  orderDirection: asc
) {
  eventType
  rawLongRate
  rawShortRate
  marketPrice
  currentLongRate
  currentShortRate
  accumulatedLongRate
  accumulatedShortRate
  epochDuration
  lastUpdatedEpoch
  startEpoch
  startEpochTimestamp
  lastUpdatedTimestamp
  snapshotLongFee
  snapshotShortFee
  timestamp
  blockNumber
  transaction
}
```

`currentLongRate` and `currentShortRate` are price-adjusted rates:

```text
currentRate = rawRate * marketPrice / 1e18
```

The contract stores price-adjusted rates because funding amount is:

```text
openAmount * fundingPerUnit / 1e18
```

### `QuoteFundingSettlement`

Immutable row for a quote-level funding realization.

Created for:

-   explicit `ChargeAccumulatedFundingFee`
-   `FillCloseRequest`
-   `ForceClosePosition`
-   `EmergencyClosePosition`
-   `ADLClose`

Key fields:

```graphql
quoteFundingSettlements(
  where: { quote: "123-0x..." }
  orderBy: timestamp
  orderDirection: asc
) {
  trigger
  openAmount
  previousAccumulatedPaidFunding
  newAccumulatedPaidFunding
  fundingDeltaPerUnit
  signedAmount
  paidByPartyA
  receivedByPartyA
  previousLastFundingPaymentTimestamp
  newLastFundingPaymentTimestamp
  previousPaidThroughEpoch
  newPaidThroughEpoch
  balanceChanged
  timestamp
  blockNumber
  transaction
}
```

Sign convention:

```text
signedAmount > 0  => PartyA paid PartyB
signedAmount < 0  => PartyA received from PartyB
```

### `Quote`

The quote stores its current funding baseline:

```graphql
quote(id: "123-0x...") {
  quoteId
  partyA
  partyB
  symbolId
  positionType
  quantity
  closedAmount
  accumulatedPaidFunding
  lastFundingPaymentTimestamp
  timestampOpenPosition
  timestampFullyClose
}
```

`accumulatedPaidFunding` is a per-unit baseline, not an amount paid by itself. Multiply baseline deltas by open amount to get the funding amount.

## Row Expansion Algorithm

### 1. Load Quote State

Fetch the quote, settlements, and funding checkpoints for:

```text
quote.symbolId
quote.partyB
quote.source
```

Include the latest checkpoint before `quote.timestampOpenPosition`. Without that earlier checkpoint, the frontend may not know which rate was active at open time.

### 2. Build Funding Rate Segments

Sort `FundingIndexCheckpoint` by `(blockNumber, transaction/log order if available, timestamp)`.

For adjacent checkpoints:

```text
checkpoint[i].currentRate applies from checkpoint[i].lastUpdatedEpoch
until checkpoint[i + 1].lastUpdatedEpoch - 1
```

Use:

```text
LONG  => currentLongRate
SHORT => currentShortRate
```

For the latest checkpoint, rates apply until the current completed epoch:

```text
currentEpoch = floor(currentTimestamp / latestCheckpoint.epochDuration)
```

Do not show `currentEpoch` itself unless you intentionally display incomplete epochs. Funding accrues in completed integer epochs.

### 3. Clip To Quote Lifetime

The quote starts accruing from:

```text
openEpoch = floor(quote.timestampOpenPosition / epochDuration)
```

For each row candidate, keep only epochs that are:

```text
epoch >= openEpoch
epoch < currentEpoch
```

If the quote is fully closed, stop at the close settlement's `newPaidThroughEpoch` or the quote close timestamp, depending on the view you want.

### 4. Apply Quote Size

For the common case with no partial closes:

```text
openAmount = quote.quantity
```

For partially closed quotes, reconstruct size over time from close quote events or settlement rows:

```text
openAmountBeforeClose = settlement.openAmount
remainingAfterClose = previousOpenAmount - closeAmount
```

Funding charged by close paths is charged on the full open amount before the close.

### 5. Compute Per-Epoch Amount

For each virtual epoch row:

```text
fundingPerUnit = rateForEpoch
signedAmount = openAmountForEpoch * fundingPerUnit / 1e18
```

Sign convention:

```text
signedAmount > 0  => PartyA owes PartyB
signedAmount < 0  => PartyA is owed by PartyB
```

### 6. Mark Paid vs Unpaid

For each `QuoteFundingSettlement`, use:

```text
previousPaidThroughEpoch
newPaidThroughEpoch
balanceChanged
```

A virtual epoch row is covered by a settlement if:

```text
epoch >= previousPaidThroughEpoch
epoch < newPaidThroughEpoch
```

Then:

```text
balanceChanged = true  => PAID
balanceChanged = false => SETTLED_WITHOUT_BALANCE_CHANGE
```

If no settlement covers a completed epoch:

```text
signedAmount > 0 => UNPAID_DEBT
signedAmount < 0 => UNPAID_RECEIVABLE
```

The sum of all unpaid rows should match the contract view:

```solidity
getQuoteFundingDebts([quoteId])
```

up to integer rounding and any row expansion limitations around partial closes.

## Recommended UI

Use a single quote funding table with these columns:

| Column               | Source                             |
| -------------------- | ---------------------------------- |
| Epoch                | virtual row                        |
| Epoch start/end      | `epoch * epochDuration`            |
| Side                 | quote `positionType`               |
| Open amount          | quote size at that epoch           |
| Funding per unit     | checkpoint current long/short rate |
| Amount               | computed by frontend               |
| Status               | settlement coverage                |
| Realized transaction | settlement transaction if covered  |
| Trigger              | settlement trigger if covered      |

Label the table as **Funding Accruals** rather than **Funding Payments**. Only rows with `PAID` are payments.

## Account-Level View

For an account-level funding panel:

-   Sum `QuoteFundingSettlement.signedAmount` for realized funding.
-   Sum currently unpaid virtual rows for estimated open funding debt.
-   For exact live debt in backend contexts, prefer the aggregate method from `offchain-upnl-calculation.md`.

Useful split:

```text
Realized funding paid
Realized funding received
Unrealized funding debt
Unrealized funding receivable
```

## Caveats

-   Funding rows are virtual; the chain does not emit one event per epoch.
-   Rate updates are not payments.
-   `ChargeAccumulatedFundingFee` is a payment/realization trigger, but the event does not contain the amount; the subgraph derives it from quote baseline movement.
-   Normal close, force close, emergency close, and ADL close can realize funding without emitting `ChargeAccumulatedFundingFee`.
-   Liquidation flows are special. Some include funding in liquidation settlement math or sync aggregate funding without normal balance transfers. Treat those separately in the UI.
