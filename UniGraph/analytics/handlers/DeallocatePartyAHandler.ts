import { DeallocatePartyAHandler as CommonDeallocatePartyAHandler } from "../../common/handlers/DeallocatePartyAHandler"
import { DeallocatePartyA } from "../../generated/symmio/symmio"

export class DeallocatePartyAHandler extends CommonDeallocatePartyAHandler {

	constructor(event: DeallocatePartyA) {
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
