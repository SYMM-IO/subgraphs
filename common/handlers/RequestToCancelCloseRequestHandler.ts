import { BaseHandler } from "./BaseHandler"
import { RequestToCancelCloseRequest } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { getGlobalCounterAndInc } from "../utils"

export class RequestToCancelCloseRequestHandler extends BaseHandler {
	protected event: RequestToCancelCloseRequest

	constructor(event: RequestToCancelCloseRequest) {
		super(event)
		this.event = event
	}

	protected getEvent(): RequestToCancelCloseRequest {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteStatus = this.event.params.quoteStatus
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'RequestToCancelCloseRequest', this.event.transaction.hash, this.event.block.number)

		quote.save()
	}
}