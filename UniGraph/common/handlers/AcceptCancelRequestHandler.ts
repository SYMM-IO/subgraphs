import { BaseHandler } from "./BaseHandler"
import { AcceptCancelRequest } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class AcceptCancelRequestHandler extends BaseHandler {
	protected event: AcceptCancelRequest

	constructor(event: AcceptCancelRequest) {
		super(event)
		this.event = event
	}

	protected getEvent(): AcceptCancelRequest {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())
		if (quote) {

			quote.globalCounter = getGlobalCounterAndInc()
			quote.quoteStatus = this.event.params.quoteStatus
			quote.timeStamp = this.event.block.timestamp
			quote.save()

			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
				'AcceptCancelRequest', this.event.transaction.hash)
		}
	}
}