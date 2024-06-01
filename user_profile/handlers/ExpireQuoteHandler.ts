import { ExpireQuoteHandler as CommonExpireQuoteHandler } from "../../common/handlers/ExpireQuoteHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { Quote } from "../../generated/schema"
import { ExpireQuote } from "../../generated/symmio/symmio"

export class ExpireQuoteHandler extends CommonExpireQuoteHandler {

	constructor(event: ExpireQuote) {
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
		quote.quoteStatus = event.params.quoteStatus
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "ExpireQuote", event.transaction.hash)
		quote.save()
	}
}
