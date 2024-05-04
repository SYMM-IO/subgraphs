import { RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler } from "../../common/handlers/RequestToCancelQuoteHandler"
import { RequestToCancelQuote } from "../../generated/symmio/symmio"

export class RequestToCancelQuoteHandler extends CommonRequestToCancelQuoteHandler {

	constructor(event: RequestToCancelQuote) {
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
