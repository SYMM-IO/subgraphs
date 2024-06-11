import { BaseHandler } from "./BaseHandler"
import { ForceCancelCloseRequest } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { getGlobalCounterAndInc } from "../utils"

export class ForceCancelCloseRequestHandler extends BaseHandler {
	protected event: ForceCancelCloseRequest

	constructor(event: ForceCancelCloseRequest) {
		super(event)
		this.event = event
	}

	protected getEvent(): ForceCancelCloseRequest {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.quoteStatus = this.event.params.quoteStatus
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'ForceCancelCloseRequest', this.event.transaction.hash, this.event.block.number)
	}
}