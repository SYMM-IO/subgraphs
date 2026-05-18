import { LiquidatePositionsPartyBHandler as CommonLiquidatePositionsPartyBHandler } from "../../../common/handlers/symmio/LiquidatePositionsPartyBHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleLiquidatePosition } from "../commonHandlers/liquidatePositions"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { captureQuoteFundingContext, FundingSettlementContext } from "../../utils/fundingHistory"

export class LiquidatePositionsPartyBHandler<T> extends CommonLiquidatePositionsPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let fundingContexts: Array<FundingSettlementContext> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			fundingContexts.push(captureQuoteFundingContext(_event, event.params.quoteIds[i]))
		}
		super.handleQuote(_event, version) // Pre-computes liquidateAmount/liquidatePrice on each quote

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			handleLiquidatePosition<T>(_event, version, event.params.quoteIds[i], "LIQUIDATE_PARTY_B", fundingContexts[i])
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
