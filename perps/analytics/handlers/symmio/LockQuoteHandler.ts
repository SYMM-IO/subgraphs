import { LockQuoteHandler as CommonLockQuoteHandler } from "../../../common/handlers/symmio/LockQuoteHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"

export class LockQuoteHandler<T> extends CommonLockQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		createQuoteEvent(
			_event,
			event.params.quoteId,
			"LOCK_QUOTE",
			new JSONBuilder().add("partyB", event.params.partyB.toHexString()).build(),
		)
	}
}
