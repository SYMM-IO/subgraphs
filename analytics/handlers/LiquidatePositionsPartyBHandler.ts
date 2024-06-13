import { LiquidatePositionsPartyBHandler as CommonLiquidatePositionsPartyBHandler } from "../../common/handlers/LiquidatePositionsPartyBHandler"
import { LiquidatePositionsPartyB } from "../../generated/symmio/symmio"
import { handleLiquidatePosition } from "../utils"

export class LiquidatePositionsPartyBHandler extends CommonLiquidatePositionsPartyBHandler {

	constructor(event: LiquidatePositionsPartyB) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
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
