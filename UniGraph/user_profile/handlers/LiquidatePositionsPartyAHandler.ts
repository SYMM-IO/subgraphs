import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../common/handlers/LiquidatePositionsPartyAHandler"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"

export class LiquidatePositionsPartyAHandler extends CommonLiquidatePositionsPartyAHandler {

	constructor(event: LiquidatePositionsPartyA) {
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
