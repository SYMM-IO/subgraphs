import { AcceptCancelCloseRequestHandler as CommonAcceptCancelCloseRequestHandler } from "../../common/handlers/AcceptCancelCloseRequestHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { Quote } from "../../generated/schema"
import { AcceptCancelCloseRequest } from "../../generated/symmio/symmio"
import { QuoteStatus } from "../utils"

export class AcceptCancelCloseRequestHandler extends CommonAcceptCancelCloseRequestHandler {

	constructor(event: AcceptCancelCloseRequest) {
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

		let quote = Quote.load(event.params.quoteId.toString())!
		quote.quoteStatus = QuoteStatus.OPENED
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "AcceptCancelCloseRequest", event.transaction.hash, event.block.number)
	}
}
