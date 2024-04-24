import { BaseHandler } from "./BaseHandler"
import { RequestToCancelQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class RequestToCancelQuoteHandler extends BaseHandler {
	private event: RequestToCancelQuote

	constructor(event: RequestToCancelQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.partyA = this.event.params.partyA
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'RequestToCancelQuote', this.event.transaction.hash)

		quote.save()
	}
}