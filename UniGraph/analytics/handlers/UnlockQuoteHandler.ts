import { UnlockQuoteHandler as CommonUnlockQuoteHandler } from "../../common/handlers/UnlockQuoteHandler"
import { UnlockQuote } from "../../generated/symmio/symmio"

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
	}
}
