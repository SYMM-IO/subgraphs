import { BaseHandler } from "./BaseHandler"
import { ForceCancelQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class ForceCancelQuoteHandler extends BaseHandler {
	protected event: ForceCancelQuote

	constructor(event: ForceCancelQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'ForceCancelQuote', this.event.transaction.hash)

		quote.save()
	}
}