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
	first: 1000
	where: {
		source: "0x..."
		symbolId: "1"
		partyB: "0x..."
		id_gt: $cursor
	}
	orderBy: id
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
-   `LIQUIDATE_PARTY_A`
-   `LIQUIDATE_PARTY_B`
-   `LIQUIDATE_CLEARING_HOUSE`

PartyA liquidation can create a transient settlement with `balanceChanged = false`. In that path, funding is included in liquidation PnL while the quote funding baseline and last-payment timestamp intentionally remain unchanged.

Key fields:

```graphql
quoteFundingSettlements(
	first: 1000
	where: { quote: "123-0x...", id_gt: $cursor }
	orderBy: id
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

Fetch the quote, every settlement, every quote event, and funding checkpoints for:

```text
quote.symbolId
quote.partyB
quote.source
```

Include the latest checkpoint before `quote.timestampOpenPosition`. Without that earlier checkpoint, the frontend may not know which rate was active at open time.

Paginate the immutable history entities. A single `first: 1000` query is not a complete history contract. A stable browser-safe pattern is:

```graphql
first: 1000
orderBy: id
orderDirection: asc
where: { id_gt: $cursor }
```

Apply quote/source/symbol/PartyB and timestamp filters in the same query, then sort the merged result by chain position before reconstructing rows. Within one transaction, the current entity IDs encode `logIndex` (and checkpoint item index). The deployed checkpoint schema does not expose transaction index, so exact ordering between different transactions in one block cannot be proven; surface that case as a warning instead of silently claiming exact order.

### 2. Build Funding Rate Segments

Sort `FundingIndexCheckpoint` by `(blockNumber, transaction/log order if available, timestamp)`.

Each checkpoint carries its own `epochDuration`. Never interpret the entire quote history using the latest duration. For checkpoint `i`:

```text
duration = checkpoint[i].epochDuration
fromEpoch = max(
  checkpoint[i].lastUpdatedEpoch,
  floor(quoteOpenTimestamp / duration)
)
toEpoch = floor(
  min(checkpoint[i + 1].timestamp, selectedStopTimestamp) / duration
)

checkpoint[i].currentRate applies for fromEpoch <= epoch < toEpoch
```

For the latest checkpoint, replace `checkpoint[i + 1].timestamp` with the selected stop timestamp. The stop is the selected as-of time, capped at `quote.timestampFullyClose` for a fully closed quote.

This timestamp boundary is essential when `SetEpochDuration` changes the grid. Epoch numbers can jump or reset when duration changes, so treat `(epochDuration, epoch)` as the row identity. Adjacent checkpoints' `lastUpdatedEpoch` values are comparable only when their durations match.

Use:

```text
LONG  => currentLongRate
SHORT => currentShortRate
```

For each segment, completed epochs end before:

```text
currentEpoch = floor(segmentStopTimestamp / checkpoint.epochDuration)
```

Do not show `currentEpoch` itself unless you intentionally display incomplete epochs. Funding accrues in completed integer epochs.

### 3. Clip To Quote Lifetime

The quote starts accruing on each duration grid from:

```text
openEpochForSegment = floor(quote.timestampOpenPosition / checkpoint.epochDuration)
```

For each row candidate, keep only epochs that are:

```text
epoch >= openEpochForSegment
epoch < currentEpochForSegment
```

If the quote is fully closed, stop at the quote close timestamp. The last completed row on a segment is the row whose end timestamp is at or before that stop.

### 4. Apply Quote Size

For the common case with no partial closes:

```text
openAmount = quote.quantity
```

For partially closed, adjusted, or liquidated quotes, reconstruct size over time from `QuoteEvent` rows:

```text
openAmountBeforeClose = settlement.openAmount
remainingAfterClose = previousOpenAmount - closeAmount
quantityAfterAdjustment = QUOTE_ADJUSTED.metadata.newQuantity
```

Treat `FILL_CLOSE`, `FORCE_CLOSE`, `EMERGENCY_CLOSE`, `ADL_CLOSE`, `LIQUIDATE_PARTY_A`, `LIQUIDATE_PARTY_B`, and `LIQUIDATE_CLEARING_HOUSE` as size-reducing events. Funding charged by a close or liquidation path uses the full open amount before that event, so a virtual row ending exactly at the event timestamp uses the pre-close size.

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

For each normal `QuoteFundingSettlement`, use timestamp coverage:

```text
fromTimestamp = previousLastFundingPaymentTimestamp
toTimestamp = newLastFundingPaymentTimestamp
```

A virtual epoch row is covered when:

```text
row.endTimestamp > fromTimestamp
row.endTimestamp <= toTimestamp
```

For a transient liquidation settlement, the previous and new last-payment timestamps are intentionally equal. Use `settlement.timestamp` as the coverage end. Timestamp coverage works across epoch-duration changes; `previousPaidThroughEpoch` and `newPaidThroughEpoch` remain useful diagnostics, but their numeric values are not comparable across different duration regimes.

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

Do not use the sum of displayed virtual rows as the authoritative realized or unpaid total. Per-row integer division and display limits can change that sum.

For exact realized totals, sum `QuoteFundingSettlement.signedAmount` at or before the selected timestamp:

```text
signedAmount > 0 => realized paid by PartyA
signedAmount < 0 => realized received by PartyA
```

For exact current unpaid funding, evaluate the latest checkpoint state at the selected timestamp using the same cumulative-index formula as core:

```text
currentEpoch = floor(asOfTimestamp / epochDuration)

cumulativeFunding =
  snapshotFunding
  + accumulatedRate * (lastUpdatedEpoch - startEpoch)
  + currentRate * (currentEpoch - lastUpdatedEpoch)

signedDebt = openAmountAtAsOf
  * (cumulativeFunding - quoteFundingBaselineAtAsOf)
  / 1e18
```

Derive `quoteFundingBaselineAtAsOf` from the latest settlement at or before the selected timestamp. If the selected time precedes the first settlement, use that first settlement's `previousAccumulatedPaidFunding` and `previousLastFundingPaymentTimestamp`. A fully closed quote has zero current unpaid funding.

This result should match the contract view for the current chain state:

```solidity
getQuoteFundingDebts([quoteId])
```

If checkpoint, settlement, quote-event, or ordering evidence is incomplete, label current debt unavailable or approximate. Do not silently replace it with the visible row sum.

## Recommended UI

Use a single quote funding table with these columns:

| Column               | Source                             |
| -------------------- | ---------------------------------- |
| Epoch                | virtual row; pair with duration    |
| Duration             | checkpoint `epochDuration`         |
| Epoch start/end      | `epoch * row.epochDuration`        |
| Side                 | quote `positionType`               |
| Open amount          | quote size at that epoch           |
| Funding per unit     | checkpoint current long/short rate |
| Amount               | computed by frontend               |
| Status               | settlement coverage                |
| Realized transaction | settlement transaction if covered  |
| Trigger              | settlement trigger if covered      |

Label the table as **Funding Accruals** rather than **Funding Payments**. Only rows with `PAID` are payments.

Place an **Authoritative ledger** summary above the table. Keep realized paid/received and current unpaid debt/receivable visually separate from the virtual row count. A “latest N rows” control should limit rendering only; it must never cap ledger totals or uPNL.

## Account-Level View

For an account-level funding panel:

-   Sum `QuoteFundingSettlement.signedAmount` for realized funding.
-   Use the cumulative funding-index formula for exact open funding debt.
-   Use virtual rows only for explanation, auditing, and approximate fallback views that are explicitly labeled.
-   For exact live debt in backend contexts, the aggregate method from `offchain-upnl-calculation.md` is also available.

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
-   Liquidation flows are special. Some include funding in liquidation settlement math or sync aggregate funding without normal balance transfers. Use `SETTLED_WITHOUT_BALANCE_CHANGE` when `balanceChanged = false`.
-   Epoch duration can change. A latest-duration-only reconstruction produces incorrect historical timestamps and amounts.
-   `currentLongRate` and `currentShortRate` are already price-adjusted in the indexed checkpoint. Raw rate and market price are diagnostic inputs, not a reason to adjust the stored current rate again.
-   Paginate checkpoints, settlements, and quote events. A row cap is a rendering preference, not an accounting boundary.
