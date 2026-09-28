# Subgraph Schema Documentation

This repository documents its GraphQL APIs in canonical `*.graphql` source
files. GraphQL descriptions are exposed through introspection and rendered by
GraphiQL, GraphQL Voyager, SpectaQL, and similar tools.

## Canonical source files

-   Perps shared models: `perps/common/models/*.graphql`.
-   Perps analytics models: `perps/analytics/schema.graphql`.
-   Perps raw-event models: `perps/events/schema.graphql`.
-   Options shared models: `options/common/models/*.graphql`.
-   Options raw-event models: `options/events/schema.graphql`.
-   Generated synchronization entities: the `SYNC_META_SCHEMA` literal in
    `scripts/manager.py`.

`scripts/manager.py` assembles root `schema.graphql` by importing the common
models selected by `subgraph_config.json`, appending documented SyncMeta types,
and appending the target module schema. Graph build copies that result to
`build/schema.graphql`.

Do not edit generated root `schema.graphql` or `build/schema.graphql` as source
of truth. Both are overwritten by the manager.

## Evidence and provenance rules

A description must be supported by the canonical schema, configured ABI, and
all handler write paths. Contract source supplies economic meaning, units,
enum values, and state-transition context:

-   Use the sibling `../perps-core` repository for current perps
    behavior, while retaining version caveats proven by historical ABIs and
    version-dispatch handlers.
-   Use the sibling `../options-core` repository for options only when
    it matches the configured options ABI. If source and ABI differ, document
    only ABI- and handler-proven facts and state the version uncertainty.
-   Use the relevant sibling contract for non-core integrations such as BuyBack
    Gateway behavior; do not infer those semantics from perps-core.

Descriptions must explain domain role, direction or sign, unit or scale,
lifecycle meaning, entity-key composition, provenance, default/fallback and
version behavior, and parallel-array alignment when those facts apply. Do not
use descriptions that merely restate an identifier, such as “field x from event
x,” “value associated with this row,” or “snapshot for the X event.” Reserved
or unused fields should say so explicitly and identify the missing producer.

## Common conventions

-   `source` is the emitting contract unless an entity documents a derived source
    or aggregation dimension.
-   `timestamp` can mean creation, contract-supplied time, or latest update; each
    mutable entity documents the actual write behavior.
-   `transactionHash` is the hash of the transaction containing the event log.
-   Graph `ethereum.Event.logIndex` is block-global: it is the zero-based position
    among all logs in the block, not a receipt-local index.
-   BigInt monetary values are raw integers. Descriptions distinguish collateral
    token native decimals from SYMMIO's 18-decimal internal accounting.
-   Analytics trade notional uses `amount * price / 1e18`.
-   Quote `tradingFee` and `closeFee` are rates. Analytics `openFee`, `closeFee`,
    `platformFee`, `openFeePaid`, and `closeFeePaid` are charged amounts.

## Quote solver fees

Analytics stores solver fees inside the existing `QuoteEvent.metadata` JSON
string. For v0.8.6 `OPEN_POSITION` and `FILL_CLOSE`, `solverFees` is a list of
`[tag, amount]` pairs for that individual execution, including each partial close.
Repeated entries sharing a tag, including different receivers, are summed only
within that execution. No separate fee entity is created; `QuoteEvent` remains
immutable and is saved once.

Tags retain the original lowercase `bytes32` hex without inferring static/dynamic
categories. Amounts are exact integer strings in 18-decimal normalized collateral
units: `"100000000000000000"` represents 0.1. Clients must use decimal or integer
arithmetic, not JavaScript `Number`. Neither the current solver `/info` config
nor a symbol's current fee schedule is used to reconstruct charges.

The handler reads `SolverFeeCharged` logs from the execution's transaction receipt,
filtering by Core address, quote id, and fee type (OPEN `0`, CLOSE `1`). Open fees
follow `OpenPosition`; close fees precede `FillCloseRequest`. Adjacent canonical
executions of the same quote bound each search, so multiple closes in one
transaction remain separate. Compatibility overloads with `lockedValues` are
ignored as execution boundaries. The existing receiver-balance refresh remains.

`solverFees: []` means the execution receipt has no matching tagged fee logs.
An absent `solverFees` field means this metadata is unavailable for that contract
version or lifecycle event type; it must not be interpreted as a zero fee.
OperationalFeeCharged is excluded because it has no quote id or tag.

The manager enables `receipt: true` only for the canonical v0.8.6 analytics open
and close handlers on real contracts. If any handler requests receipts, all data
sources and templates use mapping API `0.0.7`, as Graph Node requires a single API
version per subgraph. Other handlers, older versions, fake contracts, and raw-event
mappings do not request receipts. Subgraphs without receipt-enabled handlers keep
mapping API `0.0.6`. See The Graph's [transaction receipt documentation](https://thegraph.com/docs/en/subgraphs/developing/creating/subgraph-manifest/#transaction-receipts-in-event-handlers).
This avoids extra fee entity storage and writes, but adds receipt retrieval and
processing during indexing; it does not imply zero indexing cost.

**Migration:** `Quote.solverFees` and `QuoteSolverFee` are removed. Consumers must
query event metadata and parse its JSON. Reindex Analytics from the relevant
contract history to populate existing immutable events. Grafting at the current
head does not backfill this metadata. The raw-event subgraph is unchanged.

```graphql
query QuoteExecutionFees($quote: String!) {
	quoteEvents(where: { quote: $quote }, orderBy: globalCounter) {
		id
		type
		metadata
	}
}
```

After `JSON.parse(event.metadata)`, a close can include:

```json
{
	"amount": "1000000000000000000",
	"closePrice": "2000000000000000000",
	"quoteStatus": "6",
	"solverFees": [
		["0x5354415449435f534f4c5645525f464545000000000000000000000000000000", "100000000000000000"],
		["0x534f4c5645525f46454500000000000000000000000000000000000000000000", "400000000000000"]
	]
}
```

## Raw-event schema scope

Raw-event entities stay close to emitted payloads, while documenting every
normalization and omission. Most event IDs are
`${transactionHash}-${logIndex}`, but domain-keyed exceptions are documented
individually. `counterId` is subgraph-side ordering, and immutable entities are
append-only rows.

Raw fidelity is not implied when a handler enriches, defaults, corrects, or
omits payload data. For example, legacy ABI fields can be synthesized as zero,
some arrays are materialized into child entities, and DiamondCut currently
stores occurrence metadata without its tuple payload. These exceptions belong
in schema descriptions and focused tests rather than being hidden behind generic
“raw event” wording.
