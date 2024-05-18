import { LiquidatePartyBHandler as CommonLiquidatePartyBHandler } from "../../common/handlers/LiquidatePartyBHandler"
import { LiquidatePartyB } from "../../generated/symmio/symmio"

export class LiquidatePartyBHandler extends CommonLiquidatePartyBHandler {

	constructor(event: LiquidatePartyB) {
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
