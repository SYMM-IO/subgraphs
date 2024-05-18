import { SendQuoteHandler as CommonSendQuoteHandler } from "../../common/handlers/SendQuoteHandler"
import { SendQuote } from "../../generated/symmio/symmio"

export class SendQuoteHandler extends CommonSendQuoteHandler {

	constructor(event: SendQuote) {
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
