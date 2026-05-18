import { LiquidatePositionsForClearingHouseHandler as CommonLiquidatePositionsForClearingHouseHandler } from "../../../common/handlers/symmio/LiquidatePositionsForClearingHouseHandler"
import { Address, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { handleLiquidatePosition } from "../commonHandlers/liquidatePositions"
import { captureQuoteFundingContext, FundingSettlementContext } from "../../utils/fundingHistory"

export class LiquidatePositionsForClearingHouseHandler<T> extends CommonLiquidatePositionsForClearingHouseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let fundingContexts: Array<FundingSettlementContext> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			fundingContexts.push(captureQuoteFundingContext(_event, event.params.quoteIds[i]))
		}
		super.handle(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			handleLiquidatePosition<T>(_event, version, event.params.quoteIds[i], "LIQUIDATE_CLEARING_HOUSE", fundingContexts[i])
		}
		let seenPairs: Array<string> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let q = Quote.load(event.params.quoteIds[i].toString() + "-" + event.address.toHexString())
			if (!q || !q.partyB) continue
			let partyAHex = q.partyA.toHexString()
			let partyBHex = q.partyB!.toHexString()
			let pairKey = partyAHex + "-" + partyBHex
			if (seenPairs.includes(pairKey)) continue
			seenPairs.push(pairKey)
			updatePartyALatestBalance(_event, version, changetype<Address>(q.partyA))
			updatePartyBLatestBalance(_event, version, changetype<Address>(q.partyB!), changetype<Address>(q.partyA))
		}
	}
}
