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

Analytics exposes `Quote.solverFees`, a derived list of mutable `QuoteSolverFee`
summaries. Each summary is keyed by `${quote.id}-${tag hex}`; the Quote id already
includes the emitting Core contract address. The original `bytes32` tag is stored
as `Bytes`, without assigning static/dynamic labels or using the current solver
`/info` configuration to reconstruct historical charges.

`SolverFeeCharged.feeType` selects the cumulative amount: OPEN (`0`) increments
`openFeePaid`, and CLOSE (`1`) increments `closeFeePaid`, including partial closes.
Both fields start at zero on first creation and retain the exact emitted amount
in 18-decimal normalized collateral units. Repeated entries with the same tag,
including payments to different receivers, are summed into the same summary.
Different tags and quote ids remain separate. The handler continues refreshing
the actual receiver's balance and adds no contract reads for the fee summary.

Only indexed Quotes receive summaries. A missing Quote or unsupported fee type
is logged and does not produce a summary. An empty `solverFees` list therefore
means no applicable charges were indexed, not proof that historical fees were
zero. OperationalFeeCharged events are not included because they have no quote
id or tag.

To populate historical totals, reindex Analytics across the relevant v0.8.6 fee
events with the preceding Quote history. Grafting at the current head does not
backfill these summaries. This feature does not add a separate record per charge
or modify the raw-event subgraph.

```graphql
query QuoteSolverFees($id: ID!) {
	quote(id: $id) {
		id
		solverFees(first: 100, orderBy: id) {
			id
			tag
			openFeePaid
			closeFeePaid
		}
	}
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
