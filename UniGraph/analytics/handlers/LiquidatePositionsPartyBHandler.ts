import { LiquidatePositionsPartyBHandler as CommonLiquidatePositionsPartyBHandler } from "../../common/handlers/LiquidatePositionsPartyBHandler"
import { LiquidatePositionsPartyB } from "../../generated/symmio/symmio"

export class LiquidatePositionsPartyBHandler extends CommonLiquidatePositionsPartyBHandler {

	constructor(event: LiquidatePositionsPartyB) {
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
