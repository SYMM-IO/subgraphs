import { LiquidationDisputedHandler as CommonLiquidationDisputedHandler } from "../../common/handlers/LiquidationDisputedHandler"
import { LiquidationDisputed } from "../../generated/symmio/symmio"

export class LiquidationDisputedHandler extends CommonLiquidationDisputedHandler {

	constructor(event: LiquidationDisputed) {
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
