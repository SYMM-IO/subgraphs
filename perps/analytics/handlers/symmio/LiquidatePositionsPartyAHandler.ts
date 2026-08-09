import { LiquidatePositionsPartyAHandler as CommonLiquidatePositionsPartyAHandler } from "../../../common/handlers/symmio/LiquidatePositionsPartyAHandler"
import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleLiquidatePosition } from "../commonHandlers/liquidatePositions"
import { Account, LiquidationDetail, Quote } from "../../../../generated/schema"
import { unDecimal } from "../../utils/common"
import { getLiquidationStateData, getPartyBSettlementMode, LiquidationStateData } from "../../../common/VersionedQuoteLoader"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { LiquidatePositionsPartyA as LiquidatePositionsPartyA_0_8_6 } from "../../../../generated/symmio_0_8_6/symmio_0_8_6"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import {
	captureQuoteFundingContext,
	FundingSettlementContext,
	getPartyALiquidationFundingSettlement,
	getQuoteFundingSignedAmount,
	recordTransientQuoteFundingSettlement,
} from "../../utils/fundingHistory"
import {
	calculatePartyALiquidationReturnedCva,
	classifyPartyALiquidationAtStart,
	PARTY_A_LIQUIDATION_TYPE_LATE,
	PARTY_A_LIQUIDATION_TYPE_NONE,
	PARTY_A_LIQUIDATION_TYPE_NORMAL,
	PARTY_A_LIQUIDATION_TYPE_OVERDUE,
	upsertSettlementSnapshot,
} from "../../../common/utils/liquidationDetail"
import { createPartyALiquidationEvent } from "../../utils/liquidationEvent"
import {
	accumulatePartyALiquidationLockedValues,
	capturePartyALiquidationQuoteValues,
	loadActivePartyALiquidation,
} from "../../utils/partyALiquidation"

function getLegacyActualPaidLf(liquidationFee: BigInt): BigInt {
	let half = liquidationFee.div(BigInt.fromI32(2))
	return half.times(BigInt.fromI32(2))
}

class PartyALiquidationSettlementTerms {
	liquidationType: i32
	deficit: BigInt
	totalUnrealizedLoss: BigInt
	lockedCva: BigInt
	liquidationFee: BigInt

	constructor(liquidationType: i32, deficit: BigInt, totalUnrealizedLoss: BigInt, lockedCva: BigInt, liquidationFee: BigInt) {
		this.liquidationType = liquidationType
		this.deficit = deficit
		this.totalUnrealizedLoss = totalUnrealizedLoss
		this.lockedCva = lockedCva
		this.liquidationFee = liquidationFee
	}
}

function calculateQuoteSettlementCva(terms: PartyALiquidationSettlementTerms, quoteCva: BigInt): BigInt {
	return calculatePartyALiquidationReturnedCva(terms.liquidationType, terms.deficit, terms.lockedCva, quoteCva)
}

function calculateQuoteSettlementActualAmount(terms: PartyALiquidationSettlementTerms, pnlWithFunding: BigInt): BigInt {
	if (terms.liquidationType != PARTY_A_LIQUIDATION_TYPE_OVERDUE || pnlWithFunding.ge(BigInt.zero())) return pnlWithFunding

	let totalUnrealizedLoss = terms.totalUnrealizedLoss.neg()
	if (totalUnrealizedLoss.isZero()) return pnlWithFunding
	let lossAmount = pnlWithFunding.neg()
	let adjustedLoss = lossAmount.minus(lossAmount.times(terms.deficit).div(totalUnrealizedLoss))
	return adjustedLoss.neg()
}

function resolvePartyALiquidationSettlementTerms(
	_event: ethereum.Event,
	version: Version,
	liquidationId: Bytes,
	liqState: LiquidationStateData | null,
	entity: LiquidationDetail,
): PartyALiquidationSettlementTerms | null {
	let active = loadActivePartyALiquidation(_event.address, changetype<Address>(entity.partyA), liquidationId)
	let stateMatchesEvent = liqState !== null && liqState.liquidationId.toHexString() == liquidationId.toHexString()
	if (stateMatchesEvent && liqState!.liquidationType != PARTY_A_LIQUIDATION_TYPE_NONE) {
		let startLockedCva = entity.lockedCva === null ? BigInt.zero() : entity.lockedCva!
		if (
			liqState!.liquidationType == PARTY_A_LIQUIDATION_TYPE_LATE &&
			startLockedCva.isZero() &&
			liqState!.deficit.gt(BigInt.zero()) &&
			entity.liquidationAllocatedBalance !== null
		) {
			startLockedCva = entity.liquidationAllocatedBalance!.plus(entity.upnl).plus(liqState!.deficit)
		}
		return new PartyALiquidationSettlementTerms(
			liqState!.liquidationType,
			liqState!.deficit,
			liqState!.totalUnrealizedLoss,
			startLockedCva,
			liqState!.liquidationFee,
		)
	}

	if (version != Version.v_0_8_6 || entity.liquidationAllocatedBalance === null || active === null) {
		log.error("Cannot resolve finalized PartyA liquidation state for liquidation {}", [liquidationId.toHexString()])
		return null
	}

	let upnl = stateMatchesEvent ? liqState!.upnl : entity.upnl
	let totalUnrealizedLoss = stateMatchesEvent ? liqState!.totalUnrealizedLoss : entity.totalUnrealizedLoss
	let liquidationFee = stateMatchesEvent ? liqState!.liquidationFee : entity.liquidationFee
	let liquidationAllocatedBalance = entity.liquidationAllocatedBalance!
	let netBalance = liquidationAllocatedBalance.plus(upnl)
	let authoritativeDeficit = stateMatchesEvent ? liqState!.deficit : entity.deficit

	if (netBalance.ge(BigInt.zero()) && authoritativeDeficit.gt(BigInt.zero())) {
		// A positive persisted deficit with non-negative net can only be LATE
		// and reveals the exact CVA denominator even after finalization.
		let lockedCva = netBalance.plus(authoritativeDeficit)
		entity.liquidationType = PARTY_A_LIQUIDATION_TYPE_LATE
		entity.deficit = authoritativeDeficit
		entity.lockedCva = lockedCva
		return new PartyALiquidationSettlementTerms(PARTY_A_LIQUIDATION_TYPE_LATE, authoritativeDeficit, totalUnrealizedLoss, lockedCva, liquidationFee)
	}

	if (netBalance.lt(BigInt.zero())) {
		let classification = classifyPartyALiquidationAtStart(liquidationAllocatedBalance, upnl, BigInt.zero())
		entity.liquidationType = classification.liquidationType
		entity.deficit = classification.deficit
		return new PartyALiquidationSettlementTerms(
			classification.liquidationType,
			classification.deficit,
			totalUnrealizedLoss,
			active.capturedLockedCva,
			liquidationFee,
		)
	}

	// NORMAL and zero-deficit LATE cannot be distinguished until every
	// position event has been consumed. Their PnL treatment is identical, so
	// use provisional NORMAL terms and let FullyLiquidatedPartyA reconcile CVA
	// and the final classification from the complete event-sourced CVA total.
	return new PartyALiquidationSettlementTerms(
		PARTY_A_LIQUIDATION_TYPE_NORMAL,
		BigInt.zero(),
		totalUnrealizedLoss,
		active.capturedLockedCva,
		liquidationFee,
	)
}

export class LiquidatePositionsPartyAHandler<T> extends CommonLiquidatePositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let quoteCapture = capturePartyALiquidationQuoteValues(_event, version, event.params.quoteIds)
		let fundingContexts: Array<FundingSettlementContext> = []
		for (let i = 0; i < event.params.quoteIds.length; i++) {
			fundingContexts.push(captureQuoteFundingContext(_event, event.params.quoteIds[i]))
		}
		super.handleQuote(_event, version) // Pre-computes liquidateAmount/liquidatePrice on each quote

		let liqState: LiquidationStateData | null = null
		let liquidationId: Bytes | null = null
		if (version >= Version.v_0_8_1) {
			liqState = getLiquidationStateData(version, event.address, event.params.partyA)
			if (version == Version.v_0_8_6) {
				// @ts-ignore
				liquidationId = changetype<LiquidatePositionsPartyA_0_8_6>(event).params.liquidationId
			} else if (version == Version.v_0_8_5) {
				// @ts-ignore
				liquidationId = changetype<LiquidatePositionsPartyA_0_8_5>(event).params.liquidationId
			} else if (version == Version.v_0_8_4) {
				// @ts-ignore
				liquidationId = changetype<LiquidatePositionsPartyA_0_8_4>(event).params.liquidationId
			} else if (version == Version.v_0_8_3) {
				// @ts-ignore
				liquidationId = changetype<LiquidatePositionsPartyA_0_8_3>(event).params.liquidationId
			} else if (liqState !== null) {
				liquidationId = liqState.liquidationId
			}
		}

		let fundingAmounts: Array<BigInt> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			let fundingAmount = quote ? getQuoteFundingSignedAmount(quote, fundingContexts[i]) : BigInt.zero()
			let fundingOverride: BigInt | null = null
			if (quote !== null && liquidationId !== null) {
				let settlement = getPartyALiquidationFundingSettlement(_event, version, liquidationId, quote, fundingContexts[i])
				if (settlement.found) {
					fundingAmount = settlement.signedAmount
					fundingOverride = settlement.signedAmount
					recordTransientQuoteFundingSettlement(_event, version, quoteId, "LIQUIDATE_PARTY_A", fundingContexts[i], settlement)
				}
			}
			fundingAmounts.push(fundingAmount)
			handleLiquidatePosition<T>(_event, version, quoteId, "LIQUIDATE_PARTY_A", fundingContexts[i], fundingOverride)
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

		if (version < Version.v_0_8_1 || liquidationId === null) return

		if (version == Version.v_0_8_6) {
			let active = loadActivePartyALiquidation(event.address, event.params.partyA, liquidationId)
			if (active !== null) {
				accumulatePartyALiquidationLockedValues(
					active,
					quoteCapture.lockedCva,
					quoteCapture.lockedLf,
					quoteCapture.lockedPartyAmm,
					quoteCapture.lockedPartyBmm,
					quoteCapture.cvaComplete,
					quoteCapture.lfComplete,
					quoteCapture.partyAmmComplete,
					quoteCapture.partyBmmComplete,
					quoteCapture.partyBComplete,
					quoteCapture.settlementPartyBs,
					quoteCapture.settlementCvas,
				)
			}
		}

		let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return
		createPartyALiquidationEvent(_event, event.params.partyA, liquidationId, "LIQUIDATE_POSITIONS", null)
		let settlementTerms = resolvePartyALiquidationSettlementTerms(_event, version, liquidationId, liqState, entity)
		if (settlementTerms === null) return

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
			let cvaReturned = calculateQuoteSettlementCva(settlementTerms, quoteCapture.lockedCvas[i])
			accCva = accCva.plus(cvaReturned)
			accPotentialLf = accPotentialLf.plus(quoteCapture.lockedLfs[i])

			let quote = Quote.load(event.params.quoteIds[i].toString() + "-" + event.address.toHexString())
			if (!quote) continue
			if (!quote.liquidateAmount || !quote.liquidatePrice || !quote.openedPrice) continue

			let pnl = unDecimal(
				(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
					.times(quote.liquidatePrice!.minus(quote.openedPrice!))
					.times(quote.liquidateAmount!),
			)
			let fundingAmount = fundingAmounts[i]
			let pnlWithFunding = pnl.minus(fundingAmount)
			accPnl = accPnl.plus(pnl.minus(fundingAmount))

			if (quote.partyB) {
				let partyB = quote.partyB!
				let mode = getPartyBSettlementMode(version, event.address, changetype<Address>(partyB))
				let actualAmount = calculateQuoteSettlementActualAmount(settlementTerms, pnlWithFunding)
				upsertSettlementSnapshot(version, entity, partyB, mode, pnlWithFunding, actualAmount, cvaReturned, "pending", false)
			}
		}

		entity.paidCva = accCva
		if (version < Version.v_0_8_6) entity.paidLf = getLegacyActualPaidLf(settlementTerms.liquidationFee)
		entity.potentialLf = accPotentialLf
		entity.totalPnl = accPnl
		entity.save()
	}
}
