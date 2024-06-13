import { AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler } from "../../common/handlers/AcceptCancelRequestHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { Quote } from "../../generated/schema"
import { AcceptCancelRequest } from "../../generated/symmio/symmio"

export class AcceptCancelRequestHandler extends CommonAcceptCancelRequestHandler {

	constructor(event: AcceptCancelRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()

		let quote = Quote.load(event.params.quoteId.toString())
		if (quote == null) return
		quote.quoteStatus = event.params.quoteStatus
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "AcceptCancelRequest", event.transaction.hash, event.block.number)

	}
}
