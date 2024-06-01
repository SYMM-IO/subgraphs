import { AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler } from "../../common/handlers/AcceptCancelRequestHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/helper"
import { Quote } from "../../generated/schema"
import { AcceptCancelRequest } from "../../generated/symmio/symmio"

export class AcceptCancelRequestHandler extends CommonAcceptCancelRequestHandler {

	constructor(event: AcceptCancelRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()

		let quote = Quote.load(event.params.quoteId.toString())
		if (quote == null) return
		quote.quoteStatus = event.params.quoteStatus
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "AcceptCancelRequest", event.transaction.hash)

		quote.save()
	}
}
