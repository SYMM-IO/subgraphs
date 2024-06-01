import { AcceptCancelCloseRequestHandler as CommonAcceptCancelCloseRequestHandler } from "../../common/handlers/AcceptCancelCloseRequestHandler"
import { AcceptCancelCloseRequest } from "../../generated/symmio/symmio"

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
	}
}
