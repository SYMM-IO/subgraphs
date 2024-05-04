import {
	LiquidatePendingPositionsPartyAHandler as CommonLiquidatePendingPositionsPartyAHandler,
} from "../../common/handlers/LiquidatePendingPositionsPartyAHandler"
import { LiquidatePendingPositionsPartyA } from "../../generated/symmio/symmio"

export class LiquidatePendingPositionsPartyAHandler extends CommonLiquidatePendingPositionsPartyAHandler {

	constructor(event: LiquidatePendingPositionsPartyA) {
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
