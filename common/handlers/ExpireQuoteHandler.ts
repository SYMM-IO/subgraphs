import { BaseHandler } from "./BaseHandler"
import { ExpireQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { getGlobalCounterAndInc } from "../utils"

export class ExpireQuoteHandler extends BaseHandler {
	protected event: ExpireQuote

	constructor(event: ExpireQuote) {
		super(event)
		this.event = event
	}

	protected getEvent(): ExpireQuote {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.quoteStatus = this.event.params.quoteStatus
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'ExpireQuote', this.event.transaction.hash, this.event.block.number)
		quote.save()
	}
}