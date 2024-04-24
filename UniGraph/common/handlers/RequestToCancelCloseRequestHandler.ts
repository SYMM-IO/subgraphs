import { BaseHandler } from "./BaseHandler"
import { RequestToCancelCloseRequest } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class RequestToCancelCloseRequestHandler extends BaseHandler {
	private event: RequestToCancelCloseRequest

	constructor(event: RequestToCancelCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId

		quote.partyA = this.event.params.partyA
		quote.partyB = this.event.params.partyB
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'RequestToCancelCloseRequest', this.event.transaction.hash)

		quote.save()
	}
}