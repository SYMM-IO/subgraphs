import { UnlockQuoteHandler as CommonUnlockQuoteHandler } from "../../common/handlers/UnlockQuoteHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/helper"
import { Quote } from "../../generated/schema"
import { UnlockQuote } from "../../generated/symmio/symmio"
import { QuoteStatus } from "../utils"

export class UnlockQuoteHandler extends CommonUnlockQuoteHandler {

	constructor(event: UnlockQuote) {
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
		quote.partyB = null
		quote.quoteStatus = QuoteStatus.PENDING
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "UnlockQuote", event.transaction.hash)
		quote.save()
	}
}
