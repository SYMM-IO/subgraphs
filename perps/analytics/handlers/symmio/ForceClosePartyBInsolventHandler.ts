import { ForceClosePartyBInsolventHandler as CommonForceClosePartyBInsolventHandler } from "../../../common/handlers/symmio/ForceClosePartyBInsolventHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"

// ForceClosePartyBInsolvent is a partyB solvency signal emitted alongside ForceClosePosition
// in cross-partyB mode. It is not a quote lifecycle event. The actual position close is
// fully handled by ForceClosePositionHandler (FORCE_CLOSE QuoteEvent, trade history, volume, OI).
// Here we only record the insolvency metadata — the contract zeroes upnlPartyB/currentPrice in
// storage at finalize, so this event is the only place these values can be captured.
export class ForceClosePartyBInsolventHandler<T> extends CommonForceClosePartyBInsolventHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		createQuoteEvent(
			_event,
			event.params.quoteId,
			"FORCE_CLOSE_INSOLVENT",
			new JSONBuilder()
				.add("closedPrice", event.params.closedPrice.toString())
				.add("currentPrice", event.params.currentPrice.toString())
				.add("upnlPartyB", event.params.upnlPartyB.toString())
				.add("partyBAvailableAfterClose", event.params.partyBAvailableAfterClose.toString())
				.build(),
		)
	}
}
