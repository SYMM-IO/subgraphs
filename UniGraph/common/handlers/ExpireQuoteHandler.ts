import { BaseHandler } from "./BaseHandler"
import { ExpireQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHash } from "../helper"

export class ExpireQuoteHandler extends BaseHandler {
	private event: ExpireQuote

	constructor(event: ExpireQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.timeStamp = this.event.block.timestamp
		quote.quoteStatus = this.event.params.quoteStatus
		setEventTimestampAndTransactionHash(quote.eventsTimestamp, this.event.block.timestamp,
			'ExpireQuote', this.event.transaction.hash)
		quote.save()
	}
}