import { LiquidatePositionsPartyBHandler as CommonLiquidatePositionsPartyBHandler } from "../../common/handlers/LiquidatePositionsPartyBHandler"
import { LiquidatePositionsPartyB } from "../../generated/symmio/symmio"
import { handleLiquidatePosition } from "./handleLiquidatePosition"

export class LiquidatePositionsPartyBHandler extends CommonLiquidatePositionsPartyBHandler {

	constructor(event: LiquidatePositionsPartyB) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()

		for (let i = 0; i < event.params.quoteIds.length; i++) {
			const qId = event.params.quoteIds[i]
			handleLiquidatePosition(event, qId, "LiquidatePositionsPartyB")
		}

	}
}
