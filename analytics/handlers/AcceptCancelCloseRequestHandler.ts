import { AcceptCancelCloseRequestHandler as CommonAcceptCancelCloseRequestHandler } from "../../common/handlers/AcceptCancelCloseRequestHandler"
import { AcceptCancelCloseRequest } from "../../generated/symmio/symmio"

export class AcceptCancelCloseRequestHandler extends CommonAcceptCancelCloseRequestHandler {

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
	}
}
