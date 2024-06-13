import { ForceCancelCloseRequestHandler as CommonForceCancelCloseRequestHandler } from "../../common/handlers/ForceCancelCloseRequestHandler"
import { ForceCancelCloseRequest } from "../../generated/symmio/symmio"

export class ForceCancelCloseRequestHandler extends CommonForceCancelCloseRequestHandler {

	constructor(event: ForceCancelCloseRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
	}
}
