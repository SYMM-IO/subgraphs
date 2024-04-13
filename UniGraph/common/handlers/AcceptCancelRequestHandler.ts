import { BaseHandler } from "./BaseHandler"
import { AcceptCancelRequest } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHash } from "../helper"

export class AcceptCancelRequestHandler extends BaseHandler {
	private event: AcceptCancelRequest

	constructor(event: AcceptCancelRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		quote.save()

		setEventTimestampAndTransactionHash(quote.eventsTimestamp, this.event.block.timestamp,
			'AcceptCancelRequest', this.event.transaction.hash)
	}
}