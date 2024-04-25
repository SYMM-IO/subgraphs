import { BaseHandler } from "./BaseHandler"
import { UnlockQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class UnlockQuoteHandler extends BaseHandler {
	protected event: UnlockQuote

	constructor(event: UnlockQuote) {
		super(event)
		this.event = event
	}

	handle(): void { }
	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.partyB = null
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'UnlockQuote', this.event.transaction.hash)
		quote.save()
	}
}