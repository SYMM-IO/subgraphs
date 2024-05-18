import { AllocatePartyAHandler as CommonAllocatePartyAHandler } from "../../common/handlers/AllocatePartyAHandler"
import { AllocatePartyA } from "../../generated/symmio/symmio"

export class AllocatePartyAHandler extends CommonAllocatePartyAHandler {

	constructor(event: AllocatePartyA) {
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
