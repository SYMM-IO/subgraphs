# Migration from old structure

## Overview

This document outlines the changes made during the refactoring of the project, specifically focusing on the
reorganization and migration of subgraphs and their respective entities. The purpose of this refactoring is to optimize
the structure of the project, improve maintainability, and consolidate data where appropriate.

### Original Subgraph Structure

The original project contained the following subgraphs:

1. **Analytics**
2. **FundingRate**
3. **Main**
4. **Parties**
5. **UserProfile**

### New Subgraph Structure

After refactoring, the project now contains the following subgraphs:

1. **Analytics**
2. **Quote** (previously "Main")
3. **Liquidation**

## Detailed Changes

### 1. **Main Subgraph**

- **Rename**: The `Main` subgraph has been renamed to `Quote`.
- **Entity Conversion**: Within the `Quote` subgraph, the entity previously known as `resultEntity` has been converted
  to `quote`.
- **Liquidate Data Migration**: The data related to liquidation that was previously part of the `Main` subgraph has been
  migrated to a new subgraph named `Liquidation`.

### 2. **Liquidation Subgraph**
The `Liquidation` subgraph includes new data fields specifically related to liquidator profit.

### 3. **Analytics Subgraph**
- **Consolidation**: The `Analytics` subgraph has been expanded to include data from the following removed subgraphs:

    - **FundingRate**
    - **Parties**
    - **UserProfile**

- **Removed Subgraphs**:
    - The `FundingRate` and `Parties`subgraphs have been removed entirely. All relevant data from these
      subgraphs has been integrated into the `Analytics` subgraph.

## Migration Summary

### Data Movement Overview

- **From Main to Quote**:

    - Renaming of the subgraph.
    - Conversion of `resultEntity` to `quote`.

- **From Main to Liquidation**:

    - Migration of all liquidation-related data.
    - Addition of new data on liquidator profit.

- **From FundingRate and Parties to Analytics**:
    - Complete migration of all data from the removed subgraphs into `Analytics`.

### Entity Changes

- **Quote Subgraph**:

    - `resultEntity` → `quote`

- **Liquidation Subgraph**:
    - Inclusion of new data fields for liquidator profit.
