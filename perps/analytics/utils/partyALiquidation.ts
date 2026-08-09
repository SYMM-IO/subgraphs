import { Address, BigInt, Bytes, ethereum, store } from "@graphprotocol/graph-ts"
import { ActivePartyALiquidation, LiquidationDetail, PartyALiquidationDeferredBalanceHint, Quote } from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"
import { getQuoteData } from "../../common/VersionedQuoteLoader"
import {
	calculateFreeMarginAtStart,
	calculateLossRestsAt,
	calculatePartyALiquidationReturnedCva,
	classifyPartyALiquidationAtStart,
} from "../../common/utils/liquidationDetail"

export class PartyALiquidationQuoteCapture {
	quotePartyAs: Bytes[]
	quotePartyBs: Bytes[]
	lockedCvas: BigInt[]
	lockedLfs: BigInt[]
	lockedPartyAmms: BigInt[]
	lockedPartyBmms: BigInt[]
	cvaKnown: boolean[]
	lfKnown: boolean[]
	partyAmmKnown: boolean[]
	partyBmmKnown: boolean[]
	lockedCva: BigInt
	lockedLf: BigInt
	lockedPartyAmm: BigInt
	lockedPartyBmm: BigInt
	cvaComplete: boolean
	lfComplete: boolean
	partyAmmComplete: boolean
	partyBmmComplete: boolean
	partyBComplete: boolean
	settlementPartyBs: Bytes[]
	settlementCvas: BigInt[]

	constructor() {
		this.quotePartyAs = []
		this.quotePartyBs = []
		this.lockedCvas = []
		this.lockedLfs = []
		this.lockedPartyAmms = []
		this.lockedPartyBmms = []
		this.cvaKnown = []
		this.lfKnown = []
		this.partyAmmKnown = []
		this.partyBmmKnown = []
		this.lockedCva = BigInt.zero()
		this.lockedLf = BigInt.zero()
		this.lockedPartyAmm = BigInt.zero()
		this.lockedPartyBmm = BigInt.zero()
		this.cvaComplete = true
		this.lfComplete = true
		this.partyAmmComplete = true
		this.partyBmmComplete = true
		this.partyBComplete = true
		this.settlementPartyBs = []
		this.settlementCvas = []
	}
}

export function capturePartyALiquidationQuoteValues(event: ethereum.Event, version: Version, quoteIds: BigInt[]): PartyALiquidationQuoteCapture {
	let capture = new PartyALiquidationQuoteCapture()

	for (let i = 0; i < quoteIds.length; i++) {
		let quoteId = quoteIds[i]
		let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
		let partyA: Bytes | null = null
		let partyB: Bytes | null = null
		let cva: BigInt | null = null
		let lf: BigInt | null = null
		let partyAmm: BigInt | null = null
		let partyBmm: BigInt | null = null
		if (quote !== null) {
			partyA = quote.partyA
			partyB = quote.partyB
			cva = quote.cva
			lf = quote.lf
			partyAmm = quote.partyAmm
			partyBmm = quote.partyBmm
		}

		if (partyA === null || partyB === null || cva === null || lf === null || partyAmm === null || partyBmm === null) {
			let contractQuote = getQuoteData(version, event.address, quoteId)
			if (contractQuote !== null) {
				if (partyA === null) partyA = contractQuote.partyA
				if (partyB === null && !changetype<Address>(contractQuote.partyB).equals(Address.zero())) partyB = contractQuote.partyB
				if (cva === null) cva = contractQuote.cva
				if (lf === null) lf = contractQuote.lf
				if (partyAmm === null) partyAmm = contractQuote.partyAmm
				if (partyBmm === null) partyBmm = contractQuote.partyBmm
			}
		}

		let resolvedPartyA = partyA === null ? Address.zero() : partyA
		let resolvedPartyB = partyB === null ? Address.zero() : partyB
		capture.quotePartyAs.push(resolvedPartyA)
		capture.quotePartyBs.push(resolvedPartyB)
		if (quote !== null && quote.partyB === null && partyB !== null) {
			quote.partyB = partyB
			quote.save()
		}

		let hasCva = cva !== null
		capture.cvaKnown.push(hasCva)
		if (!hasCva) {
			capture.cvaComplete = false
			capture.lockedCvas.push(BigInt.zero())
		} else {
			capture.lockedCva = capture.lockedCva.plus(cva!)
			capture.lockedCvas.push(cva!)
			if (partyB === null) capture.partyBComplete = false
			capture.settlementPartyBs.push(resolvedPartyB)
			capture.settlementCvas.push(cva!)
		}

		let hasLf = lf !== null
		capture.lfKnown.push(hasLf)
		if (!hasLf) {
			capture.lfComplete = false
			capture.lockedLfs.push(BigInt.zero())
		} else {
			capture.lockedLf = capture.lockedLf.plus(lf!)
			capture.lockedLfs.push(lf!)
		}

		let hasPartyAmm = partyAmm !== null
		capture.partyAmmKnown.push(hasPartyAmm)
		if (!hasPartyAmm) {
			capture.partyAmmComplete = false
			capture.lockedPartyAmms.push(BigInt.zero())
		} else {
			capture.lockedPartyAmm = capture.lockedPartyAmm.plus(partyAmm!)
			capture.lockedPartyAmms.push(partyAmm!)
		}

		let hasPartyBmm = partyBmm !== null
		capture.partyBmmKnown.push(hasPartyBmm)
		if (!hasPartyBmm) {
			capture.partyBmmComplete = false
			capture.lockedPartyBmms.push(BigInt.zero())
		} else {
			capture.lockedPartyBmm = capture.lockedPartyBmm.plus(partyBmm!)
			capture.lockedPartyBmms.push(partyBmm!)
		}
	}

	return capture
}

function activeId(source: Address, partyA: Address): string {
	return partyA.toHexString() + "-" + source.toHexString()
}

function deferredBalanceHintId(event: ethereum.Event, partyA: Address): string {
	return activeId(event.address, partyA) + "-" + event.transaction.hash.toHexString()
}

function detailId(source: Address, partyA: Address, liquidationId: Bytes): string {
	return partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + source.toHexString()
}

export function startPartyALiquidationTracking(event: ethereum.Event, partyA: Address, liquidationId: Bytes): void {
	let id = activeId(event.address, partyA)
	let entity = new ActivePartyALiquidation(id)
	entity.source = event.address
	entity.partyA = partyA
	entity.liquidationId = liquidationId
	entity.liquidationDetailId = detailId(event.address, partyA, liquidationId)
	entity.startTransaction = event.transaction.hash
	entity.capturedLockedCva = BigInt.zero()
	entity.capturedLockedLf = BigInt.zero()
	entity.capturedLockedPartyAmm = BigInt.zero()
	entity.capturedLockedPartyBmm = BigInt.zero()
	entity.cvaComplete = true
	entity.lfComplete = true
	entity.partyAmmComplete = true
	entity.partyBmmComplete = true
	entity.partyBComplete = true
	entity.capturedQuotePartyBs = []
	entity.capturedQuoteCvas = []
	entity.save()
}

export function loadActivePartyALiquidation(source: Address, partyA: Address, liquidationId: Bytes): ActivePartyALiquidation | null {
	let entity = ActivePartyALiquidation.load(activeId(source, partyA))
	if (entity === null || entity.liquidationId.toHexString() != liquidationId.toHexString()) return null
	return entity
}

export function accumulatePartyALiquidationLockedValues(
	entity: ActivePartyALiquidation,
	lockedCva: BigInt,
	lockedLf: BigInt,
	lockedPartyAmm: BigInt,
	lockedPartyBmm: BigInt,
	cvaComplete: boolean,
	lfComplete: boolean,
	partyAmmComplete: boolean,
	partyBmmComplete: boolean,
	partyBComplete: boolean,
	quotePartyBs: Bytes[],
	quoteCvas: BigInt[],
): void {
	entity.capturedLockedCva = entity.capturedLockedCva.plus(lockedCva)
	entity.capturedLockedLf = entity.capturedLockedLf.plus(lockedLf)
	entity.capturedLockedPartyAmm = entity.capturedLockedPartyAmm.plus(lockedPartyAmm)
	entity.capturedLockedPartyBmm = entity.capturedLockedPartyBmm.plus(lockedPartyBmm)
	entity.cvaComplete = entity.cvaComplete && cvaComplete
	entity.lfComplete = entity.lfComplete && lfComplete
	entity.partyAmmComplete = entity.partyAmmComplete && partyAmmComplete
	entity.partyBmmComplete = entity.partyBmmComplete && partyBmmComplete
	entity.partyBComplete = entity.partyBComplete && partyBComplete
	let capturedQuotePartyBs = entity.capturedQuotePartyBs
	let capturedQuoteCvas = entity.capturedQuoteCvas
	for (let i = 0; i < quoteCvas.length; i++) {
		capturedQuotePartyBs.push(quotePartyBs[i])
		capturedQuoteCvas.push(quoteCvas[i])
	}
	entity.capturedQuotePartyBs = capturedQuotePartyBs
	entity.capturedQuoteCvas = capturedQuoteCvas
	entity.save()
}

function findPartyBIndex(partyBs: Bytes[], partyB: Bytes): i32 {
	let partyBHex = partyB.toHexString()
	for (let i = 0; i < partyBs.length; i++) {
		if (partyBs[i].toHexString() == partyBHex) return i
	}
	return -1
}

export function reconcileCompletedPartyALiquidation(source: Address, partyA: Address, liquidationId: Bytes): void {
	let active = loadActivePartyALiquidation(source, partyA, liquidationId)
	if (active === null) return

	let detail = LiquidationDetail.load(active.liquidationDetailId)
	if (detail === null || detail.liquidationAllocatedBalance === null) return

	let liquidationAllocatedBalance = detail.liquidationAllocatedBalance!
	if (active.lfComplete) detail.lockedLf = active.capturedLockedLf
	if (active.partyAmmComplete) detail.lockedPartyAmm = active.capturedLockedPartyAmm
	if (active.partyBmmComplete) detail.lockedPartyBmm = active.capturedLockedPartyBmm
	if (active.lfComplete) detail.potentialLf = active.capturedLockedLf

	if (active.cvaComplete) {
		let classification = classifyPartyALiquidationAtStart(liquidationAllocatedBalance, detail.upnl, active.capturedLockedCva)
		detail.liquidationType = classification.liquidationType
		detail.deficit = classification.deficit
		detail.lockedCva = active.capturedLockedCva

		let settlementPartyBs = detail.settlementPartyBs
		let settlementCvaReturned: BigInt[] = []
		if (settlementPartyBs !== null) {
			for (let i = 0; i < settlementPartyBs.length; i++) settlementCvaReturned.push(BigInt.zero())
		}

		let paidCva = BigInt.zero()
		let quotePartyBs = active.capturedQuotePartyBs
		let quoteCvas = active.capturedQuoteCvas
		for (let i = 0; i < quoteCvas.length; i++) {
			let returnedCva = calculatePartyALiquidationReturnedCva(
				classification.liquidationType,
				classification.deficit,
				active.capturedLockedCva,
				quoteCvas[i],
			)
			paidCva = paidCva.plus(returnedCva)
			if (settlementPartyBs !== null && active.partyBComplete) {
				let partyBIndex = findPartyBIndex(settlementPartyBs, quotePartyBs[i])
				if (partyBIndex >= 0) {
					settlementCvaReturned[partyBIndex] = settlementCvaReturned[partyBIndex].plus(returnedCva)
				}
			}
		}
		detail.paidCva = paidCva
		if (settlementPartyBs !== null && active.partyBComplete) detail.settlementCvaReturned = settlementCvaReturned
	}

	detail.settlementAttributionComplete = active.cvaComplete && active.partyBComplete
	if (active.cvaComplete && active.lfComplete) {
		detail.freeMarginAtStart = calculateFreeMarginAtStart(liquidationAllocatedBalance, active.capturedLockedCva, active.capturedLockedLf)
		detail.lossRestsAt = calculateLossRestsAt(liquidationAllocatedBalance, active.capturedLockedCva, active.capturedLockedLf, detail.upnl)
	}
	detail.save()
}

export function loadCurrentPartyALiquidation(source: Address, partyA: Address): ActivePartyALiquidation | null {
	return ActivePartyALiquidation.load(activeId(source, partyA))
}

export function clearPartyALiquidationTracking(source: Address, partyA: Address): void {
	store.remove("ActivePartyALiquidation", activeId(source, partyA))
}

export function recordPartyALiquidationDeferredBalance(event: ethereum.Event, partyA: Address, amount: BigInt): void {
	let id = deferredBalanceHintId(event, partyA)
	let entity = new PartyALiquidationDeferredBalanceHint(id)
	entity.source = event.address
	entity.partyA = partyA
	entity.amount = amount
	entity.transaction = event.transaction.hash
	entity.save()
}

export function applyPartyALiquidationDeferredBalance(event: ethereum.Event, partyA: Address, liquidationId: Bytes): void {
	let id = deferredBalanceHintId(event, partyA)
	let hint = PartyALiquidationDeferredBalanceHint.load(id)
	if (hint === null) return

	let detail = LiquidationDetail.load(detailId(event.address, partyA, liquidationId))
	if (detail !== null) {
		detail.deferredBalance = hint.amount
		detail.save()
	}
	store.remove("PartyALiquidationDeferredBalanceHint", id)
}

export function setPartyALiquidationReimbursement(event: ethereum.Event, partyA: Address, newBalance: BigInt): void {
	let active = ActivePartyALiquidation.load(activeId(event.address, partyA))
	if (active === null) return

	let detail = LiquidationDetail.load(active.liquidationDetailId)
	if (detail === null) return
	detail.reimbursement = newBalance
	detail.save()
}

export function setPartyALiquidationPaidLf(event: ethereum.Event, partyA: Address, amount: BigInt): void {
	let active = ActivePartyALiquidation.load(activeId(event.address, partyA))
	if (active === null) return

	let detail = LiquidationDetail.load(active.liquidationDetailId)
	if (detail === null) return
	detail.liquidationFee = amount
	detail.paidLf = amount
	detail.save()
}
