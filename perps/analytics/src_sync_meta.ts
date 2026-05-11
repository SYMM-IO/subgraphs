import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { EntityVersion, SyncMeta } from "../../generated/schema"

const GLOBAL_VERSION = "2026-05-09-001"
const VERSIONS_HASH = "account:v1|balance_change:v1|daily_account_owner_history:v1|daily_history:v1|monthly_history:v1|quote:v1|quote_event:v1|solver_daily_history:v1|solver_only_daily_history:v1|symbol:v1|total_account_owner_history:v1|total_history:v1|user:v1|weekly_history:v1"

function ensureEntityVersion(id: string, versionValue: string, timestamp: BigInt): void {
    let entityVersion = EntityVersion.load(id)
    let isNew = entityVersion == null
    if (entityVersion == null) {
        entityVersion = new EntityVersion(id)
        entityVersion.meta = "meta"
    }
    if (isNew || entityVersion.version != versionValue) {
        entityVersion.meta = "meta"
        entityVersion.version = versionValue
        entityVersion.updatedAt = timestamp
        entityVersion.save()
    }
}

export function ensureSyncMeta(block: ethereum.Block): void {
    let meta = SyncMeta.load("meta")
    if (meta != null) {
        if (meta.globalVersion == GLOBAL_VERSION && meta.versionsHash == VERSIONS_HASH) {
            return
        }
    }
    if (meta == null) {
        meta = new SyncMeta("meta")
    }
    meta.globalVersion = GLOBAL_VERSION
    meta.versionsHash = VERSIONS_HASH
    meta.deployedAt = block.timestamp
    meta.save()
    ensureEntityVersion("account", "v1", block.timestamp)
    ensureEntityVersion("balance_change", "v1", block.timestamp)
    ensureEntityVersion("daily_account_owner_history", "v1", block.timestamp)
    ensureEntityVersion("daily_history", "v1", block.timestamp)
    ensureEntityVersion("monthly_history", "v1", block.timestamp)
    ensureEntityVersion("quote", "v1", block.timestamp)
    ensureEntityVersion("quote_event", "v1", block.timestamp)
    ensureEntityVersion("solver_daily_history", "v1", block.timestamp)
    ensureEntityVersion("solver_only_daily_history", "v1", block.timestamp)
    ensureEntityVersion("symbol", "v1", block.timestamp)
    ensureEntityVersion("total_account_owner_history", "v1", block.timestamp)
    ensureEntityVersion("total_history", "v1", block.timestamp)
    ensureEntityVersion("user", "v1", block.timestamp)
    ensureEntityVersion("weekly_history", "v1", block.timestamp)
}
