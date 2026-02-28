import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"

// ForceClosePartyBInsolvent is a supplementary event emitted alongside ForceClosePosition
// in cross-partyB mode when partyB is insolvent. The actual position close is handled by
// ForceClosePositionHandler — this handler only exists for subclass overrides (e.g. analytics
// recording insolvency-specific metadata).
export class ForceClosePartyBInsolventHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {}
}
