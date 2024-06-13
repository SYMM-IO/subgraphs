import { UnlockQuoteHandler as CommonUnlockQuoteHandler } from "../../common/handlers/UnlockQuoteHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { Quote } from "../../generated/schema"
import { UnlockQuote } from "../../generated/symmio/symmio"
import { QuoteStatus } from "../utils"

export class UnlockQuoteHandler extends CommonUnlockQuoteHandler {

	constructor(event: UnlockQuote) {
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

		let quote = Quote.load(event.params.quoteId.toString())!
		quote.partyB = null
		quote.quoteStatus = QuoteStatus.PENDING
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "UnlockQuote", event.transaction.hash, event.block.number)
	}
}
