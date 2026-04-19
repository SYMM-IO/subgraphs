# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Symmio subgraphs for The Graph protocol. Indexes on-chain events from multiple SYMMIO smart contract versions across many EVM chains (Base, Arbitrum, BNB, Blast, Mantle, etc.). Written in AssemblyScript (graph-ts), managed by a Python code-generation and deployment pipeline.

## Upstream Contract Source

The SYMMIO smart contract source code lives at `../perps-core` (relative to this repo). The current version is 0.8.5. Reference it when you need to check event definitions, struct layouts, or contract logic.

## Build & Deploy Commands

All commands run from the repo root.

```bash
# Prepare, codegen, and build a subgraph (most common workflow)
python3 scripts/manager.py configs/perps/base.json perps/events

# Same but also regenerate src_*.ts entry files
python3 scripts/manager.py configs/perps/base.json perps/events --create-src

# Also regenerate contract_utils_*.ts files
python3 scripts/manager.py configs/perps/base.json perps/events --create-utils

# Also regenerate handler scaffold files
python3 scripts/manager.py configs/perps/base.json perps/events --create-handlers

# Deploy to Goldsky
python3 scripts/manager.py configs/perps/base.json perps/events v1.0.0 --deploy

# Deploy to local Graph node (Docker)
python3 scripts/manager.py configs/perps/docker.json perps/events
./scripts/manage -d symmio-events

# Batch deploy / manage multiple chains via the web dashboard
uv run scripts/fleet_web.py  # http://127.0.0.1:8787

# Clean generated files
./scripts/clean.sh
```

The manager.py script: cleans old artifacts, generates `schema.graphql` and `subgraph.yaml`, copies ABIs, runs `graph codegen` and `graph build`.

## Architecture

### Module Structure

Each subgraph module is either **standalone** (`symm/`, `timelocks/`, `vaults/`) or **nested under a product** (`perps/events`, `perps/analytics`, `perps/liquidation`, `options/events`).

Multi-module products share a `common/` directory:
- `perps/common/` — shared handlers, models, utils for all perps subgraphs
- `options/common/` — shared handlers, models for all options subgraphs

### Within Each Module

- `schema.graphql` — module-specific GraphQL entities
- `subgraph_config.json` — declares which models to import from `common/models/`
- `deps_{abi}_{version}.json` — maps entity names to events they depend on
- `src_{abi}_{version}.ts` — generated entry points; each exports handler functions that instantiate handler classes
- `src_fake.ts` — stub handler for "fake" contracts (versions not deployed on a chain)
- `handlers/{abi}/` — handler classes, one per event

### Handler Pattern

Handlers use a generic class hierarchy with version-aware dispatch:

1. **BaseHandler** (`common/BaseHandler.ts`) — defines version enums (`Version`, `MultiAccountVersion`, `FeeCollectorVersion`, `AccountLayerVersion`) and empty virtual methods (`handle`, `handleQuote`, `handleAccount`)
2. **Common handler** (`common/handlers/{abi}/{Event}Handler.ts`) — extends BaseHandler, implements shared logic. Uses `changetype<T>()` to cast the generic event parameter
3. **Module handler** (`{module}/handlers/{abi}/{Event}Handler.ts`) — extends the common handler, may add module-specific fields or override behavior via `super.handle()`

The `src_{abi}_{version}.ts` files wire events to handlers:
```typescript
export function handleSendQuote(event: SendQuote): void {
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_2)
}
```

### Version Management

The protocol has multiple on-chain contract versions (symmio 0_8_0 through 0_8_5, symmioMultiAccount 1-3, etc.). The manager.py script creates "fake" contracts for versions not deployed on a given chain so all handler code compiles. `VersionedQuoteLoader` (`perps/common/VersionedQuoteLoader.ts`) normalizes version-specific struct differences (e.g., `mm` vs `partyAmm`/`partyBmm`, presence of `affiliate` field).

### Config Files

- `configs/perps/{chain}.json` — per-chain contract addresses, ABIs, versions, start/end blocks, deploy URLs
- `configs/abis/{abi}_{version}.json` — contract ABIs
- `configs/vaults/`, `configs/timelocks/`, `configs/options/`, `configs/symm/` — same pattern for other products

### Dependency Resolution

`deps_{abi}_{version}.json` files map GraphQL entity names to the smart contract events that populate them. The manager reads these to determine which event handlers to include in `subgraph.yaml`. Both common and module-specific deps files are merged.

## Code Conventions

- **TypeScript (AssemblyScript)**: tabs for indentation, no semicolons, 2-space tab width in .ts files (see `.prettierrc.yml`)
- **Python** (`scripts/`): 4-space indent, 150 char line width, double quotes (see `ruff.toml`)
- Entity IDs typically use `event.transaction.hash.toHex() + "-" + event.logIndex.toString()` or `{quoteId}-{contractAddress}`
- Global ordering uses `GlobalCounter` entity (monotonically incrementing BigInt via `getGlobalCounterAndInc()`)
- All contract calls use `try_` variants to handle reverts gracefully (never call contract methods directly)

## Goldsky Deployment Rules
- **NEVER create, delete, or modify any Goldsky tag without explicit user confirmation.** Always ask before running any `goldsky subgraph tag` command. Deleting/creating versioned deployments themselves is fine, but all tag operations require user approval.

## Key Files

- `scripts/manager.py` — main build/deploy orchestrator; defines `abi_versions` dict, generates subgraph.yaml, src files, handler scaffolds, contract_utils
- `perps/common/VersionedQuoteLoader.ts` — version-abstraction layer for reading on-chain quote and liquidation data
- `perps/common/BaseHandler.ts` — base classes and version enums for perps handlers
- `perps/common/contract_utils_0_8_*.ts` — generated wrappers around contract read calls per version
