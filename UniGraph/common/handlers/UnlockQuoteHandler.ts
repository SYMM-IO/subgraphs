import { BaseHandler } from "./BaseHandler"
import { UnlockQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { getGlobalCounterAndInc } from "../utils"

export class UnlockQuoteHandler extends BaseHandler {
	protected event: UnlockQuote

	constructor(event: UnlockQuote) {
		super(event)
		this.event = event
	}

	protected getEvent(): UnlockQuote {
		return this.event
	}

	handle(): void {
	}

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