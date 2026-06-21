import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../../common/handlers/symmio/LiquidatePositionsPartyAHandler"
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleLiquidatePosition } from "../commonHandlers/liquidatePositions"
import { Account, LiquidationDetail, Quote } from "../../../../generated/schema"
import { unDecimal } from "../../utils/common"
import { getLiquidationStateData, getPartyBSettlementMode, LiquidationStateData } from "../../../common/VersionedQuoteLoader"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { captureQuoteFundingContext, FundingSettlementContext, getQuoteFundingSignedAmount } from "../../utils/fundingHistory"
import { upsertSettlementSnapshot } from "../../../common/utils/liquidationDetail"
import { createPartyALiquidationEvent } from "../../utils/liquidationEvent"

const LIQUIDATION_TYPE_LATE = 2
const LIQUIDATION_TYPE_OVERDUE = 3

function getActualPaidLf(version: Version, liquidationFee: BigInt): BigInt {
	if (version >= Version.v_0_8_6) return liquidationFee

	let half = liquidationFee.div(BigInt.fromI32(2))
	return half.times(BigInt.fromI32(2))
}

function getLockedCvaAtStart(entity: LiquidationDetail): BigInt {
	return entity.lockedCva ? entity.lockedCva! : BigInt.zero()
}

function calculateQuoteSettlementCva(liqState: LiquidationStateData, entity: LiquidationDetail, quote: Quote): BigInt {
	let quoteCva = quote.cva ? quote.cva! : BigInt.zero()
	if (liqState.liquidationType == LIQUIDATION_TYPE_LATE) {
		let lockedCva = getLockedCvaAtStart(entity)
		if (lockedCva.isZero()) return quoteCva
		return quoteCva.minus(quoteCva.times(liqState.deficit).div(lockedCva))
	}
	if (liqState.liquidationType == LIQUIDATION_TYPE_OVERDUE) return BigInt.zero()
	return quoteCva
}

function calculateQuoteSettlementActualAmount(liqState: LiquidationStateData, pnlWithFunding: BigInt): BigInt {
	if (liqState.liquidationType != LIQUIDATION_TYPE_OVERDUE || pnlWithFunding.ge(BigInt.zero())) return pnlWithFunding

	let totalUnrealizedLoss = liqState.totalUnrealizedLoss.neg()
	if (totalUnrealizedLoss.isZero()) return pnlWithFunding
	let lossAmount = pnlWithFunding.neg()
	let adjustedLoss = lossAmount.minus(lossAmount.times(liqState.deficit).div(totalUnrealizedLoss))
	return adjustedLoss.neg()
}

export class LiquidatePositionsPartyAHandler<T> extends CommonLiquidatePositionsPartyAHandler<T> {
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
			handleLiquidatePosition<T>(_event, version, event.params.quoteIds[i], "LIQUIDATE_PARTY_A", fundingContexts[i])
		}

		updatePartyALatestBalance(_event, version, event.params.partyA)
		let seenPartyBs: Array<string> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quote = Quote.load(event.params.quoteIds[i].toString() + "-" + event.address.toHexString())
			if (!quote || !quote.partyB) continue
			let partyBHex = quote.partyB!.toHexString()
			if (seenPartyBs.includes(partyBHex)) continue
			seenPartyBs.push(partyBHex)
			updatePartyBLatestBalance(_event, version, changetype<Address>(quote.partyB!), event.params.partyA)
		}

		// Accumulate paidCva, potentialLf, and totalPnl; paidLf tracks the actual liquidator reward from liquidation state.
		if (version < Version.v_0_8_1) return

		let liqState = getLiquidationStateData(version, event.address, event.params.partyA)
		if (!liqState) return

		let liquidationId: Bytes = liqState.liquidationId
		if (version == Version.v_0_8_5) {
			// @ts-ignore
			let e = changetype<LiquidatePositionsPartyA_0_8_5>(event)
			liquidationId = e.params.liquidationId
		} else if (version == Version.v_0_8_4) {
			// @ts-ignore
			let e = changetype<LiquidatePositionsPartyA_0_8_4>(event)
			liquidationId = e.params.liquidationId
		} else if (version == Version.v_0_8_3) {
			// @ts-ignore
			let e = changetype<LiquidatePositionsPartyA_0_8_3>(event)
			liquidationId = e.params.liquidationId
		}

		let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return
		createPartyALiquidationEvent(_event, event.params.partyA, liquidationId, "LIQUIDATE_POSITIONS", null)

		if (!entity.affiliate) {
			let partyAAccount = Account.load(event.params.partyA.toHexString())
			if (partyAAccount) {
				entity.affiliate = partyAAccount.accountSource
			}
		}

		let accCva = entity.paidCva ? entity.paidCva! : BigInt.zero()
		let accPotentialLf = entity.potentialLf ? entity.potentialLf! : BigInt.zero()
		let accPnl = entity.totalPnl ? entity.totalPnl! : BigInt.zero()

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quote = Quote.load(event.params.quoteIds[i].toString() + "-" + event.address.toHexString())
			if (!quote) continue
			if (!quote.liquidateAmount || !quote.liquidatePrice || !quote.openedPrice) continue

			accCva = accCva.plus(quote.cva ? quote.cva! : BigInt.zero())
			accPotentialLf = accPotentialLf.plus(quote.lf ? quote.lf! : BigInt.zero())

			let pnl = unDecimal(
				(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
					.times(quote.liquidatePrice!.minus(quote.openedPrice!))
					.times(quote.liquidateAmount!),
			)
			let fundingAmount = getQuoteFundingSignedAmount(quote, fundingContexts[i])
			let pnlWithFunding = pnl.minus(fundingAmount)
			accPnl = accPnl.plus(pnl.minus(fundingAmount))

			if (quote.partyB) {
				let partyB = quote.partyB!
				let mode = getPartyBSettlementMode(version, event.address, changetype<Address>(partyB))
				let actualAmount = calculateQuoteSettlementActualAmount(liqState, pnlWithFunding)
				let cvaReturned = calculateQuoteSettlementCva(liqState, entity, quote)
				upsertSettlementSnapshot(entity, partyB, mode, pnlWithFunding, actualAmount, cvaReturned, "pending", false)
			}
		}

		entity.paidCva = accCva
		entity.paidLf = getActualPaidLf(version, liqState.liquidationFee)
		entity.potentialLf = accPotentialLf
		entity.totalPnl = accPnl
		entity.save()
	}
}
