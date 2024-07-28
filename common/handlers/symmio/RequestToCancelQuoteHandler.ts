import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote&analitics&user"
import { ethereum } from "@graphprotocol/graph-ts";

export class RequestToCancelQuoteHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = event.params.quoteId
		quote.partyA = event.params.partyA
		quote.quoteStatus = event.params.quoteStatus
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'RequestToCancelQuote', _event)

	}
}