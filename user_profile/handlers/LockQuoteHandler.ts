import { LockQuoteHandler as CommonLockQuoteHandler } from "../../common/handlers/LockQuoteHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { Quote } from "../../generated/schema"
import { LockQuote } from "../../generated/symmio/symmio"
import { QuoteStatus } from "../utils"

export class LockQuoteHandler extends CommonLockQuoteHandler {

	constructor(event: LockQuote) {
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
		quote.partyB = event.params.partyB
		quote.quoteStatus = QuoteStatus.LOCKED
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "LockQuote", event.transaction.hash)
		quote.save()
	}
}
