# Perps Subgraph Schema Documentation

This repo documents subgraph APIs at the GraphQL schema level. Descriptions in
`*.graphql` files use GraphQL's standard description syntax, so they are exposed
through introspection and can be rendered by GraphiQL, GraphQL Voyager, SpectaQL,
or similar tools.

## Source Files

-   Common imported models live in `perps/common/models/*.graphql`.
-   Analytics-only models live in `perps/analytics/schema.graphql`.
-   Raw event models live in `perps/events/schema.graphql`.
-   `scripts/manager.py` assembles the root `schema.graphql` during builds by
    importing the configured common models, adding sync metadata, and appending
    the target module schema.

Do not edit the generated root `schema.graphql` as the source of truth. It is
overwritten by the manager.

## Common Conventions

-   `source` is the emitting contract address for the entity's indexed event
    stream, unless the entity description says otherwise.
-   `timestamp` is a block timestamp. On mutable entities it is usually the latest
    handler update timestamp unless the field says it is creation-only.
-   `updateTimestamp` is the latest profile or aggregate update timestamp.
-   `blockNumber`, `transaction`, `transactionHash`, `transactionIndex`,
    `logIndex`, and `blockHash` are raw block/log metadata.
-   BigInt monetary values are raw indexed integer values. They are not formatted
    for token display.
-   Analytics trade notional fields use the subgraph's `unDecimal` helper:
    `amount * price / 1e18`.
-   Quote fee-rate fields such as `Quote.tradingFee` and `Quote.closeFee` are
    rates stored on quote state. Analytics fields such as `openFee`, `closeFee`,
    `platformFee`, `openFeePaid`, and `closeFeePaid` are actual charged fee
    amounts.

## Event Schema Scope

`perps/events/schema.graphql` is intentionally close to raw event storage. Every
raw event model and field has a GraphQL description, but many field descriptions
are deliberately conservative unless schema, ABI, and handler assignments prove a
more specific meaning.

Safe event-envelope meanings:

-   `id` is usually `${transactionHash}-${logIndex}`. Some specialized entities
    use a domain id and should be checked individually.
-   `source` is the emitting contract address.
-   `counterId` is a subgraph-side monotonically increasing ordering id.
-   `blockNumber`, `blockTimestamp`, and `blockHash` are block metadata.
-   `transactionHash`, `transactionIndex`, and `logIndex` locate the event log.
-   `@entity(immutable: true)` means the row is an append-only event snapshot.

For richer event-field docs, generate them from schema, ABI, and handler
assignments together instead of guessing from field names alone.
