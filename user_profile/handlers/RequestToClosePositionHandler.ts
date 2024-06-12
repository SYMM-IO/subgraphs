import { RequestToClosePositionHandler as CommonRequestToClosePositionHandler } from "../../common/handlers/RequestToClosePositionHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { Quote } from "../../generated/schema"
import { RequestToClosePosition } from "../../generated/symmio/symmio"
import { QuoteStatus } from "../utils"

export class RequestToClosePositionHandler extends CommonRequestToClosePositionHandler {

	constructor(event: RequestToClosePosition) {
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
		quote.quoteStatus = QuoteStatus.CLOSE_PENDING
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "RequestToClosePosition", event.transaction.hash, event.block.number)
	}
}
