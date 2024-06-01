import { ForceCancelQuoteHandler as CommonForceCancelQuoteHandler } from "../../common/handlers/ForceCancelQuoteHandler"
import { ForceCancelQuote } from "../../generated/symmio/symmio"

export class ForceCancelQuoteHandler extends CommonForceCancelQuoteHandler {

	constructor(event: ForceCancelQuote) {
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
