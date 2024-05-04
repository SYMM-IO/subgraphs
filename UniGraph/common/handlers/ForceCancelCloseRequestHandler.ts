import { BaseHandler } from "./BaseHandler"
import { ForceCancelCloseRequest } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class ForceCancelCloseRequestHandler extends BaseHandler {
	protected event: ForceCancelCloseRequest

	constructor(event: ForceCancelCloseRequest) {
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
			'ForceCancelCloseRequest', this.event.transaction.hash)
	}
}