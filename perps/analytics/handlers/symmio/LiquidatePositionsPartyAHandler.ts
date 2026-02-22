import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../../common/handlers/symmio/LiquidatePositionsPartyAHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleLiquidatePosition } from "../commonHandlers/liquidatePositions"

export class LiquidatePositionsPartyAHandler<T> extends CommonLiquidatePositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		super.handleQuote(_event, version) // Pre-computes liquidateAmount/liquidatePrice on each quote

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			handleLiquidatePosition<T>(_event, version, event.params.quoteIds[i], "LIQUIDATE_PARTY_A")
		}
	}
}
