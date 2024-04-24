import { BaseHandler } from "./BaseHandler"
import { ForceCancelCloseRequest } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHash } from "../helper"

export class ForceCancelCloseRequestHandler extends BaseHandler {
	private event: ForceCancelCloseRequest

	constructor(event: ForceCancelCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHash(quote.eventsTimestamp, this.event.block.timestamp,
			'ForceCancelCloseRequest', this.event.transaction.hash)
	}
}