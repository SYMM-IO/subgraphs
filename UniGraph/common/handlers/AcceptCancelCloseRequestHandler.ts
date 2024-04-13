import { BaseHandler } from "./BaseHandler"
import { AcceptCancelCloseRequest } from "../../generated/symmio/symmio"
import { EventsTimestamp, Quote, TransactionsHash } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHash } from "../helper"

export class AcceptCancelCloseRequestHandler extends BaseHandler {
	private event: AcceptCancelCloseRequest

	constructor(event: AcceptCancelCloseRequest) {
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
			'AcceptCancelCloseRequest', this.event.transaction.hash)
	}
}