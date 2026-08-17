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
