
import {AllocatePartyBHandler as CommonAllocatePartyBHandler} from "../../common/handlers/AllocatePartyBHandler"
import {AllocatePartyB} from "../../generated/symmio/symmio"

export class AllocatePartyBHandler extends CommonAllocatePartyBHandler {

    constructor(event: AllocatePartyB) {
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
