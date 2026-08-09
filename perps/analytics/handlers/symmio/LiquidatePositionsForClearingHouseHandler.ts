import { LiquidatePositionsForClearingHouseHandler as CommonLiquidatePositionsForClearingHouseHandler } from "../../../common/handlers/symmio/LiquidatePositionsForClearingHouseHandler"
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { LiquidationDetail, Quote } from "../../../../generated/schema"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { handleLiquidatePosition } from "../commonHandlers/liquidatePositions"
import { captureQuoteFundingContext, FundingSettlementContext, getQuoteFundingSignedAmount } from "../../utils/fundingHistory"
import {
	accumulatePartyALiquidationLockedValues,
	capturePartyALiquidationQuoteValues,
	loadCurrentPartyALiquidation,
} from "../../utils/partyALiquidation"
import { unDecimal } from "../../utils/common"

export class LiquidatePositionsForClearingHouseHandler<T> extends CommonLiquidatePositionsForClearingHouseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quoteCapture = capturePartyALiquidationQuoteValues(_event, version, event.params.quoteIds)
		let fundingContexts: Array<FundingSettlementContext> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			fundingContexts.push(captureQuoteFundingContext(_event, event.params.quoteIds[i]))
		}
		if (version == Version.v_0_8_6) {
			let noPartyBs: Bytes[] = []
			let noCvas: BigInt[] = []
			for (let i = 0; i < event.params.quoteIds.length; i++) {
				let partyA = changetype<Address>(quoteCapture.quotePartyAs[i])
				if (partyA.equals(Address.zero())) continue
				let active = loadCurrentPartyALiquidation(event.address, partyA)
				if (active === null) continue
				accumulatePartyALiquidationLockedValues(
					active,
					quoteCapture.lockedCvas[i],
					quoteCapture.lockedLfs[i],
					quoteCapture.lockedPartyAmms[i],
					quoteCapture.lockedPartyBmms[i],
					quoteCapture.cvaKnown[i],
					quoteCapture.lfKnown[i],
					quoteCapture.partyAmmKnown[i],
					quoteCapture.partyBmmKnown[i],
					true,
					noPartyBs,
					noCvas,
				)
			}
		}
		super.handle(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			handleLiquidatePosition<T>(_event, version, quoteId, "LIQUIDATE_CLEARING_HOUSE", fundingContexts[i], null)
			if (version != Version.v_0_8_6) continue

			let partyA = changetype<Address>(quoteCapture.quotePartyAs[i])
			if (partyA.equals(Address.zero())) continue
			let active = loadCurrentPartyALiquidation(event.address, partyA)
			if (active === null) continue
			let detail = LiquidationDetail.load(active.liquidationDetailId)
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (detail === null || quote === null) continue

			if (quoteCapture.lfKnown[i]) {
				let potentialLf = detail.potentialLf === null ? BigInt.zero() : detail.potentialLf!
				detail.potentialLf = potentialLf.plus(quoteCapture.lockedLfs[i])
			}
			if (quote.liquidateAmount !== null && quote.liquidatePrice !== null && quote.openedPrice !== null) {
				let pnl = unDecimal(
					(quote.positionType == 0 ? BigInt.fromI32(1) : BigInt.fromI32(-1))
						.times(quote.liquidatePrice!.minus(quote.openedPrice!))
						.times(quote.liquidateAmount!),
				)
				let fundingAmount = getQuoteFundingSignedAmount(quote, fundingContexts[i])
				let totalPnl = detail.totalPnl === null ? BigInt.zero() : detail.totalPnl!
				detail.totalPnl = totalPnl.plus(pnl).minus(fundingAmount)
			}
			detail.save()
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
