import { BaseHandler } from "./BaseHandler"
import { AcceptCancelCloseRequest } from "../../generated/symmio/symmio"
import { Quote, } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class AcceptCancelCloseRequestHandler extends BaseHandler {
	protected event: AcceptCancelCloseRequest

	constructor(event: AcceptCancelCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void { }
	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		quote.save()

		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'AcceptCancelCloseRequest', this.event.transaction.hash)
	}
}