import { BaseHandler } from "../BaseHandler"
import { LockQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { getGlobalCounterAndInc } from "../utils"

export class LockQuoteHandler extends BaseHandler {
	protected event: LockQuote

	constructor(event: LockQuote) {
		super(event)
		this.event = event
	}

	protected getEvent(): LockQuote {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = this.event.params.quoteId
		quote.partyB = this.event.params.partyB
		quote.quoteStatus = 1
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'LockQuote', this.event.transaction.hash, this.event.block.number)
	}
}