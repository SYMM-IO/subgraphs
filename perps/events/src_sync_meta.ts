import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { EntityVersion, SyncMeta } from "../../generated/schema"

const GLOBAL_VERSION = "2026-08-17-001"
const VERSIONS_HASH = "allocate_party_a:v1|buyback:v1|buyback_day:v1|buyback_deposit:v1|buyback_gateway_stats:v1|deallocate_party_a:v1|deposit:v1|force_close_position:v1|request_to_cancel_close_request:v1|request_to_cancel_quote:v1|request_to_close_position:v1|send_quote:v2|withdraw:v1"

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
    ensureEntityVersion("allocate_party_a", "v1", block.timestamp)
    ensureEntityVersion("buyback", "v1", block.timestamp)
    ensureEntityVersion("buyback_day", "v1", block.timestamp)
    ensureEntityVersion("buyback_deposit", "v1", block.timestamp)
    ensureEntityVersion("buyback_gateway_stats", "v1", block.timestamp)
    ensureEntityVersion("deallocate_party_a", "v1", block.timestamp)
    ensureEntityVersion("deposit", "v1", block.timestamp)
    ensureEntityVersion("force_close_position", "v1", block.timestamp)
    ensureEntityVersion("request_to_cancel_close_request", "v1", block.timestamp)
    ensureEntityVersion("request_to_cancel_quote", "v1", block.timestamp)
    ensureEntityVersion("request_to_close_position", "v1", block.timestamp)
    ensureEntityVersion("send_quote", "v2", block.timestamp)
    ensureEntityVersion("withdraw", "v1", block.timestamp)
}
