import { LiquidatePartyAHandler as CommonLiquidatePartyAHandler } from "../../common/handlers/LiquidatePartyAHandler"
import { LiquidatePartyA } from "../../generated/symmio/symmio"

export class LiquidatePartyAHandler extends CommonLiquidatePartyAHandler {

	constructor(event: LiquidatePartyA) {
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
