# Offchain Liquidation and uPNL Calculation via Subgraph

## Overview

This document describes the subgraph entities added to support offchain uPNL calculation and exact PartyA solvency checks from the analytics subgraph. The main target reader is a liquidator bot or a backend that needs to identify liquidatable users without making contract view calls on every evaluation loop.

Frontend funding-history entities such as `FundingIndexCheckpoint` and `QuoteFundingSettlement` are intentionally optional for this service flow. They support UI reconstruction of per-epoch rows, while this document's hot path remains `AggregatedPosition` + latest `FundingFeeState` + `LatestAccountBalance`.

## Background: How uPNL Works Onchain

The SYMMIO contract maintains aggregated position data per `(partyA, partyB, symbolId, positionType)` bucket. Instead of iterating every open quote (O(quotes)), it tracks:

-   **aggregatedAmount**: sum of all open amounts (`quantity - closedAmount`) in the bucket
-   **aggregatedNotional**: sum of `(openAmount * openedPrice)` for each quote — used to derive `avgOpenPrice = aggregatedNotional / aggregatedAmount`
-   **weightedPaidFunding**: sum of `(openAmount * accumulatedPaidFunding / 1e18)` — tracks how much funding has been settled per position

The uPNL formula for a single bucket is:

```
priceComponent = (currentPrice - avgOpenPrice) * aggregatedAmount    [LONG]
               = (avgOpenPrice - currentPrice) * aggregatedAmount    [SHORT]

fundingDebt = (aggregatedAmount * currentFee / 1e18) - weightedPaidFunding

uPNL = priceComponent - fundingDebt
```

Total uPNL for a partyA is the sum across all buckets.

## New Subgraph Entities

### AggregatedPosition

Mirrors the contract's per-bucket aggregation. One entity per unique `(partyA, partyB, symbolId, positionType, source)` combination.

```graphql
type AggregatedPosition @entity(immutable: false) {
	id: ID! # {partyA}-{partyB}-{symbolId}-{positionType}-{source}
	source: Bytes! # contract address
	partyA: Bytes!
	partyB: Bytes!
	symbolId: BigInt!
	symbolName: String! # denormalized symbol name for price-service lookup
	positionType: Int! # 0 = LONG, 1 = SHORT
	aggregatedAmount: BigInt! # sum of open amounts (18 decimals)
	aggregatedNotional: BigInt! # sum of (openAmount * openedPrice) (36 decimals)
	weightedPaidFunding: BigInt! # sum of (openAmount * accumulatedPaidFunding / 1e18) (signed, 18 decimals)
	openPositionsCount: Int! # number of open positions in this bucket
	isActive: Boolean! # true while the bucket still has open exposure
	closedTimestamp: BigInt # set when the bucket becomes inactive
	closedBlockNumber: BigInt # set when the bucket becomes inactive
	closedTransaction: Bytes # set when the bucket becomes inactive
	timestamp: BigInt!
	blockNumber: BigInt!
	transaction: Bytes!
}
```

**How avgOpenPrice is derived:**

```
avgOpenPrice = aggregatedNotional / aggregatedAmount
```

This is not stored directly because maintaining the two components separately avoids precision loss during incremental updates.

**Lifecycle:**

-   Created when the first position opens in a bucket
-   Updated on every position open, close, liquidation, price settlement, and funding charge
-   Soft-closed when `aggregatedAmount` reaches zero and `openPositionsCount` reaches zero
-   Stable IDs are preserved for downstream systems such as Goldsky pipelines; consumers should treat `isActive = false` as "remove from hot path"

### FundingFeeState (expanded)

Already existed with basic rate info. Now includes additional fields read from the contract's `getFundingFeesOfPartyB()` view function. One entity per `(symbolId, partyB, source)`.

```graphql
type FundingFeeState @entity(immutable: false) {
	id: ID! # {symbolId}-{partyB}-{source}
	source: Bytes!
	symbolId: BigInt!
	symbolName: String! # denormalized symbol name for downstream caches
	partyB: Bytes!
	currentLongRate: BigInt # current epoch rate for longs
	currentShortRate: BigInt # current epoch rate for shorts
	accumulatedLongRate: BigInt # [NEW] historical weighted average rate for longs
	accumulatedShortRate: BigInt # [NEW] historical weighted average rate for shorts
	epochDuration: BigInt # seconds per funding epoch
	lastUpdatedEpoch: BigInt # [NEW] epoch number when rates were last updated
	startEpoch: BigInt # [NEW] epoch when funding tracking started
	startEpochTimestamp: BigInt # [NEW] timestamp of start epoch
	lastUpdatedTimestamp: BigInt # [NEW] timestamp of last rate update
	snapshotLongFee: BigInt # [NEW] frozen cumulative fee before the last epoch-duration change
	snapshotShortFee: BigInt # [NEW] frozen cumulative fee before the last epoch-duration change
	lastMarketPrice: BigInt # last known market price from funding event
	updateTimestamp: BigInt! # block timestamp of last update
}
```

**Why it's required for exact values:**

Between funding charges, funding debt still changes offchain as time advances, but in core it changes in whole-epoch steps rather than continuously. `FundingFeeState` provides the exact inputs needed to compute that unsettled portion. The subgraph refreshes it not only on `Set*FundingFee` / `SetEpochDuration`, but also on lifecycle events that advance the on-chain funding accumulator such as `OpenPosition`, close flows, `ChargeAccumulatedFundingFee`, and clearing-house liquidation close. For an exact bot, `FundingFeeState` must be synced alongside `AggregatedPosition` and `LatestAccountBalance`.

### Events That Update FundingFeeState

| Event                                                                             | What changes                                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `SetLongFundingFee` / `SetShortFundingFee`                                        | current rate, historical accumulator, epoch metadata                               |
| `UpdateAccumulatedFundingFee`                                                     | both current rates, historical accumulator, epoch metadata                         |
| `SetEpochDuration`                                                                | epoch duration, epoch metadata, frozen snapshots                                   |
| `OpenPosition`                                                                    | syncs epoch metadata because core updates accumulated funding state before opening |
| `FillCloseRequest` / `ForceClosePosition` / `EmergencyClosePosition` / `ADLClose` | syncs epoch metadata because core may charge accumulated funding before closing    |
| `ChargeAccumulatedFundingFee`                                                     | syncs the funding accumulator after charging                                       |
| `LiquidatePositionsForClearingHouse`                                              | syncs the funding accumulator before clearing-house close                          |

### LatestAccountBalance (existing, unchanged)

Tracks the current balance state per account. One entity per `(account, source)` for partyA, or `(partyB, partyA, source)` for partyB.

```graphql
type LatestAccountBalance @entity(immutable: false) {
	id: ID!
	source: Bytes!
	account: Bytes!
	counterParty: Bytes # null for partyA, partyA address for partyB
	accountType: String! # "PARTY_A" or "PARTY_B"
	allocatedBalance: BigInt!
	lockedCva: BigInt!
	lockedLf: BigInt!
	lockedPartyAmm: BigInt!
	lockedPartyBmm: BigInt!
	pendingLockedCva: BigInt!
	pendingLockedLf: BigInt!
	pendingLockedPartyAmm: BigInt!
	pendingLockedPartyBmm: BigInt!
	timestamp: BigInt!
	blockNumber: BigInt!
	transaction: Bytes!
}
```

## Events That Update AggregatedPosition

| Event                                | What changes                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `OpenPosition`                       | amount++, notional += filledAmount \* openedPrice, positionsCount++                               |
| `FillCloseRequest`                   | amount -= filledAmount, notional -= filledAmount \* openedPrice, positionsCount-- if fully closed |
| `ForceClosePosition`                 | same as FillCloseRequest                                                                          |
| `EmergencyClosePosition`             | same as FillCloseRequest                                                                          |
| `ADLClose`                           | same as partial/full close                                                                        |
| `LiquidatePositionsPartyA`           | amount -= liquidateAmount, notional -= liquidateAmount \* openedPrice, positionsCount--           |
| `LiquidatePositionsPartyB`           | same as LiquidatePositionsPartyA                                                                  |
| `LiquidatePositionsForClearingHouse` | same as LiquidatePositionsPartyA                                                                  |
| `ChargeFundingRate`                  | notional += openAmount \* (newPrice - prevPrice) (openedPrice changes)                            |
| `ChargeAccumulatedFundingFee`        | weightedPaidFunding += openAmount \* (newFunding - prevFunding) / 1e18                            |
| `SettleUpnl`                         | notional += openAmount \* (newPrice - prevPrice) (openedPrice changes)                            |
| `SettleUpnlUnified`                  | same as SettleUpnl                                                                                |

## Bot Implementation Guide

### 1. Entities to Sync

| Entity                 | Required? | Sync strategy                                                          |
| ---------------------- | --------- | ---------------------------------------------------------------------- |
| `AggregatedPosition`   | Yes       | Sync the full state table and use `isActive` to manage the hot cache   |
| `LatestAccountBalance` | Yes       | Sync only `PARTY_A` rows for liquidation checks                        |
| `FundingFeeState`      | Yes       | Required to compute exact unsettled funding debt between charge events |

### 2. External Data

-   **Current prices per symbolName**: from oracle / price feed (not in subgraph)
-   **Current timestamp / block time**: used to compute `epochsSinceLastUpdate` for exact funding debt

`symbolId` remains the canonical onchain identity and should still be used to join `AggregatedPosition` to `FundingFeeState`. `symbolName` is denormalized into both models so the bot can map directly into its price service without an extra symbol table lookup.

### 3. Calculating uPNL for a partyA

```python
def calculate_upnl(party_a, aggregated_positions, funding_states, current_prices):
    """
    aggregated_positions: list of AggregatedPosition entities for this partyA
    funding_states: dict of (symbolId, partyB) -> FundingFeeState
    current_prices: dict of symbolName -> current price (18 decimals)
    """
    total_upnl = 0

    for pos in aggregated_positions:
        if pos.aggregatedAmount == 0:
            continue

        current_price = current_prices[pos.symbolName]
        avg_open_price = pos.aggregatedNotional // pos.aggregatedAmount

        # Price component
        if pos.positionType == 0:  # LONG
            price_upnl = (current_price - avg_open_price) * pos.aggregatedAmount
        else:  # SHORT
            price_upnl = (avg_open_price - current_price) * pos.aggregatedAmount

        price_upnl = price_upnl // 10**18  # unDecimal

        # Funding debt must be included for exact uPNL
        funding_debt = calculate_funding_debt(pos, funding_states)

        total_upnl += price_upnl - funding_debt

    return total_upnl
```

### 4. Calculating Funding Debt

```python
def calculate_funding_debt(pos, funding_states):
    """
    Computes unsettled funding debt for an AggregatedPosition bucket.
    """
    key = (pos.symbolId, pos.partyB)
    state = funding_states.get(key)
    if not state or not state.epochDuration or state.epochDuration == 0:
        return 0

    now = current_timestamp()

    # Pick the rate based on position type
    if pos.positionType == 0:  # LONG
        snapshot_fee = state.snapshotLongFee or 0
        accumulated_rate = state.accumulatedLongRate or 0
        current_rate = state.currentLongRate or 0
    else:  # SHORT
        snapshot_fee = state.snapshotShortFee or 0
        accumulated_rate = state.accumulatedShortRate or 0
        current_rate = state.currentShortRate or 0

    # Epochs calculation. This mirrors LibFundingRate.getEpochsSinceLastUpdate():
    # currentEpoch - lastUpdatedEpoch. Do not use elapsed seconds since
    # lastUpdatedTimestamp; lastUpdatedTimestamp is not necessarily an epoch boundary.
    epochs_before_last_update = (state.lastUpdatedEpoch or 0) - (state.startEpoch or 0)
    current_epoch = now // state.epochDuration
    epochs_since_last_update = current_epoch - (state.lastUpdatedEpoch or current_epoch)

    # Current fee = frozen snapshot + accumulated portion + current portion
    current_fee = snapshot_fee + (accumulated_rate * epochs_before_last_update) + (current_rate * epochs_since_last_update)

    # Funding debt
    funding_debt = (pos.aggregatedAmount * current_fee // 10**18) - pos.weightedPaidFunding

    return funding_debt
```

### 5. Exact PartyA Liquidation Solvency Check

For a liquidator notifier, this is the main formula that matters. The liquidation path in core does **not** use `partyAAvailableForQuote()`. It uses `partyAAvailableBalanceForLiquidation()`:

```python
def calculate_liquidation_available_balance(party_a_balance, total_upnl):
    """
    Mirrors LibAccount.partyAAvailableBalanceForLiquidation().
    """
    return (
        party_a_balance.allocatedBalance
        - party_a_balance.lockedCva
        - party_a_balance.lockedLf
        + total_upnl
    )


def is_party_a_liquidatable(party_a_balance, total_upnl):
    liquidation_available_balance = calculate_liquidation_available_balance(
        party_a_balance,
        total_upnl,
    )
    return liquidation_available_balance < 0
```

This is the exact pre-check used by the liquidation flow:

-   `liquidatable` if `allocatedBalance - lockedCva - lockedLf + upnl < 0`
-   `solvent` otherwise

### 6. Exact PartyA Liquidation Type

Once `liquidation_available_balance < 0`, core classifies the liquidation type like this:

```python
def get_liquidation_type(party_a_balance, liquidation_available_balance):
    assert liquidation_available_balance < 0

    deficit = -liquidation_available_balance

    if deficit < party_a_balance.lockedLf:
        return "NORMAL"
    elif deficit <= party_a_balance.lockedLf + party_a_balance.lockedCva:
        return "LATE"
    else:
        return "OVERDUE"
```

This mirrors `LibLiquidation.determineLiquidationType()`.

### Liquidator Execution Note

The subgraph-based solvency check should be treated as the exact **candidate detection** path for the bot. The eventual liquidation transaction still depends on fresh signed liquidation data on the contract side, including signed uPNL, signed prices, and timestamp-valid signatures. In other words:

-   subgraph + prices + current time => exact candidate detection
-   liquidation transaction => still needs fresh execution-time signed inputs

### 7. PartyA Available-For-Quote Formula (Secondary)

This formula is still useful for account-management style checks, but it is **not** the trigger for the liquidator notifier hot path:

```python
def calculate_available_for_quote(party_a_balance, total_upnl):
    """
    Mirrors LibAccount.partyAAvailableForQuote().
    Not the same as liquidation availability.
    """
    allocated = party_a_balance.allocatedBalance

    total_locked = (
        party_a_balance.lockedCva +
        party_a_balance.lockedLf +
        party_a_balance.lockedPartyAmm +
        party_a_balance.pendingLockedCva +
        party_a_balance.pendingLockedLf +
        party_a_balance.pendingLockedPartyAmm
    )

    locked_cva_lf_and_pending = (
        party_a_balance.lockedCva +
        party_a_balance.lockedLf +
        party_a_balance.pendingLockedCva +
        party_a_balance.pendingLockedLf +
        party_a_balance.pendingLockedPartyAmm
    )

    if total_upnl >= 0:
        return allocated + total_upnl - total_locked

    party_a_mm = party_a_balance.lockedPartyAmm
    mm = max(-total_upnl, party_a_mm)
    return allocated - locked_cva_lf_and_pending - mm
```

### 8. Example GraphQL Queries

**All active aggregated positions for a partyA:**

```graphql
{
	aggregatedPositions(where: { partyA: "0x...", isActive: true }) {
		id
		partyB
		symbolId
		symbolName
		positionType
		aggregatedAmount
		aggregatedNotional
		weightedPaidFunding
		openPositionsCount
		isActive
		timestamp
	}
}
```

**Balance for a partyA:**

```graphql
{
	latestAccountBalances(where: { account: "0x...", accountType: "PARTY_A" }) {
		account
		allocatedBalance
		lockedCva
		lockedLf
		timestamp
	}
}
```

**Funding fee state for relevant symbols:**

```graphql
{
	fundingFeeStates(where: { partyB: "0x..." }) {
		symbolId
		symbolName
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
	}
}
```

### 9. Liquidator Bot Hot Path

If the goal is a liquidator notifier, the bot should optimize for the liquidation predicate, not for generic UI-style account analytics.

The minimum exact hot-path state is:

-   `AggregatedPosition`: `partyA`, `partyB`, `symbolId`, `symbolName`, `positionType`, `aggregatedAmount`, `aggregatedNotional`, `weightedPaidFunding`, `isActive`
-   `FundingFeeState`: funding-rate and epoch fields for `(symbolId, partyB)`, plus `symbolName`
-   `LatestAccountBalance` for `accountType = PARTY_A`: `allocatedBalance`, `lockedCva`, `lockedLf`
-   offchain inputs: current prices keyed by `symbolName` and current timestamp

Recommended key usage in the bot:

-   Use `symbolId` to join `AggregatedPosition` with `FundingFeeState`
-   Use `symbolName` to fetch or cache market prices from external price services
-   Keep both in the local state so you preserve exact onchain identity while still matching offchain infra

The bot does **not** need to pull the whole subgraph every 30ms. A better pattern is:

-   Load an initial snapshot into a local in-memory cache
-   Apply only incremental updates from your replication layer
-   Recompute price uPNL only for users touched by symbols whose prices changed
-   Recompute funding debt only for users touched by `(symbolId, partyB)` pairs whose funding epoch changed or whose `FundingFeeState` was updated onchain
-   Re-run the liquidation predicate only for users touched by one of those changes or by a balance update

### 10. Goldsky Pipeline Recommendation

For Goldsky users, the recommended architecture is:

1. Mirror the subgraph entities into a low-latency sink such as PostgreSQL, Kafka, or Webhook.
2. Keep only the fields needed by the liquidator bot.
3. Maintain a local cache keyed by entity ID and react to updates.
4. Evaluate the liquidation predicate locally at high frequency.

Relevant Goldsky docs:

-   Subgraph sources and automatic deduplication: https://docs.goldsky.com/mirror/sources/subgraphs
-   Pipeline config reference: https://docs.goldsky.com/mirror/reference/config-file/pipeline
-   Example multi-entity pipeline definitions: https://docs.goldsky.com/mirror/guides/merging-crosschain-subgraphs

Recommended sink strategy:

-   **PostgreSQL**: easiest operational model; good if the bot already has a DB-backed state service
-   **Kafka / Webhook**: better if the bot wants push-style updates and an in-memory stream processor

Goldsky's subgraph source deduplicates by entity ID by default, so the sink naturally behaves like a latest-state mirror. That makes soft-closing a better fit than hard deletes for `AggregatedPosition`.

Recommended mirrored state:

-   `AggregatedPosition`: keep all rows, including `isActive = false`, so closures propagate as updates rather than relying on delete handling
-   `AggregatedPosition`: keep `symbol_name` in the mirrored state so the price loop does not need a separate symbol lookup table
-   `FundingFeeState`: keep the full exact funding state
-   `FundingFeeState`: mirror `symbol_name` as well so funding rows can be inspected and debugged without a join
-   `LatestAccountBalance`: mirror only `PARTY_A` rows and only the liquidation-relevant columns

Important operational note:

-   Do **not** filter `AggregatedPosition` to only active rows inside the pipeline if that would hide the inactive update from the sink.
-   Instead, mirror the row with `isActive`, then remove it from the bot's hot cache when `isActive` flips to `false`.

An example Goldsky pipeline definition is included in [goldsky-liquidator-state.example.yaml](./goldsky-liquidator-state.example.yaml).

### 11. Sync Strategy

For direct subgraph consumers:

-   **By timestamp**: query entities where `timestamp > lastSyncTimestamp` to get only changed records
-   **By block**: query entities where `blockNumber > lastSyncBlock`
-   **Subscription**: use GraphQL subscriptions if supported by your Graph node

For `AggregatedPosition`, rows are now soft-closed instead of deleted. Consumers should:

-   keep the row in replicated storage
-   remove it from the hot path when `isActive = false`
-   optionally retain `closedTimestamp`, `closedBlockNumber`, and `closedTransaction` for audit/debugging

## Precision Notes

-   All BigInt values use 18-decimal fixed-point unless noted otherwise
-   `aggregatedNotional` is 36 decimals (amount \* price, both 18 decimals) — divide by `aggregatedAmount` to get `avgOpenPrice` in 18 decimals
-   `weightedPaidFunding` is signed (can be negative if the position received funding)
-   Funding rates (`currentLongRate`, `accumulatedLongRate`, etc.) are signed and scaled by 1e18
-   Exact liquidation solvency for PartyA requires exact uPNL from `AggregatedPosition` + `FundingFeeState`
-   Exact liquidation solvency for PartyA also requires `allocatedBalance`, `lockedCva`, and `lockedLf` from `LatestAccountBalance`
-   Exact funding debt also requires using the current evaluation timestamp when computing `epochsSinceLastUpdate`
-   Funding debt only changes when the integer epoch count changes; it does not move every millisecond
-   Do not drop `FundingFeeState` even if charge events are frequent; doing so produces an approximation, not an exact value
-   `AggregatedPosition.isActive = false` is the soft-close signal for downstream systems
