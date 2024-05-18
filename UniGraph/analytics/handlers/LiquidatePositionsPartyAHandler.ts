import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../common/handlers/LiquidatePositionsPartyAHandler"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"
import { handleLiquidatePosition } from "./utils"

export class LiquidatePositionsPartyAHandler extends CommonLiquidatePositionsPartyAHandler {

	constructor(event: LiquidatePositionsPartyA) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		const event = this.getEvent()
		for (let i = 0; i < event.params.quoteIds.length; i++) {
			const qId = event.params.quoteIds[i]
			handleLiquidatePosition(event, qId)
		}

		super.handleQuote() // AverageClosePrice should be updated after that calculation in handleLiquidatePosition method
	}
}
