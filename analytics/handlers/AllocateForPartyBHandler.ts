import { AllocateForPartyBHandler as CommonAllocateForPartyBHandler } from "../../common/handlers/AllocateForPartyBHandler"
import { AllocateForPartyB } from "../../generated/symmio/symmio"

export class AllocateForPartyBHandler extends CommonAllocateForPartyBHandler {

	constructor(event: AllocateForPartyB) {
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
