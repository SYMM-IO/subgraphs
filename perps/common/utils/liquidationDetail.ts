import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../generated/schema"
import { PartyASettlementBalanceData } from "../VersionedQuoteLoader"
import { Version } from "../BaseHandler"

export const PARTY_A_LIQUIDATION_TYPE_NONE = 0
export const PARTY_A_LIQUIDATION_TYPE_NORMAL = 1
export const PARTY_A_LIQUIDATION_TYPE_LATE = 2
export const PARTY_A_LIQUIDATION_TYPE_OVERDUE = 3

export class PartyALiquidationClassification {
	liquidationType: i32
	deficit: BigInt

	constructor(liquidationType: i32, deficit: BigInt) {
		this.liquidationType = liquidationType
		this.deficit = deficit
	}
}

function copyBytesArray(values: Bytes[] | null): Bytes[] {
	let result: Bytes[] = []
	if (values === null) return result
	for (let i = 0; i < values.length; i++) result.push(values[i])
	return result
}

function copyStringArray(values: string[] | null): string[] {
	let result: string[] = []
	if (values === null) return result
	for (let i = 0; i < values.length; i++) result.push(values[i])
	return result
}

function copyBigIntArray(values: BigInt[] | null): BigInt[] {
	let result: BigInt[] = []
	if (values === null) return result
	for (let i = 0; i < values.length; i++) result.push(values[i])
	return result
}

function findSettlementIndex(partyBs: Bytes[], partyB: Bytes): i32 {
	let partyBHex = partyB.toHexString()
	for (let i = 0; i < partyBs.length; i++) {
		if (partyBs[i].toHexString() == partyBHex) return i
	}
	return -1
}

function ensureStringLength(values: string[], length: i32, fallback: string): void {
	while (values.length < length) values.push(fallback)
}

function ensureBigIntLength(values: BigInt[], length: i32): void {
	while (values.length < length) values.push(BigInt.zero())
}

export function calculateFreeMarginAtStart(allocatedBalance: BigInt, lockedCva: BigInt, lockedLf: BigInt): BigInt {
	return allocatedBalance.minus(lockedCva).minus(lockedLf)
}

export function calculateLossRestsAt(allocatedBalance: BigInt, lockedCva: BigInt, lockedLf: BigInt, upnl: BigInt): BigInt {
	return calculateFreeMarginAtStart(allocatedBalance, lockedCva, lockedLf).plus(upnl)
}

/**
 * Mirrors LibPartyALiquidationShared.startPartyALiquidation.
 *
 * The core's available balance is allocation + uPNL - locked CVA - locked LF.
 * Removing locked LF from the severity boundaries leaves:
 *   allocation + uPNL < 0             => OVERDUE
 *   allocation + uPNL <= locked CVA  => LATE
 *   otherwise                         => NORMAL
 *
 * Callers must provide the complete PartyA open-position CVA total.
 */
export function classifyPartyALiquidationAtStart(
	liquidationAllocatedBalance: BigInt,
	upnl: BigInt,
	lockedCva: BigInt,
): PartyALiquidationClassification {
	let netBalance = liquidationAllocatedBalance.plus(upnl)
	if (netBalance.lt(BigInt.zero())) {
		return new PartyALiquidationClassification(PARTY_A_LIQUIDATION_TYPE_OVERDUE, netBalance.neg())
	}
	if (netBalance.le(lockedCva)) {
		return new PartyALiquidationClassification(PARTY_A_LIQUIDATION_TYPE_LATE, lockedCva.minus(netBalance))
	}
	return new PartyALiquidationClassification(PARTY_A_LIQUIDATION_TYPE_NORMAL, BigInt.zero())
}

export function calculatePartyALiquidationReturnedCva(liquidationType: i32, deficit: BigInt, lockedCva: BigInt, quoteCva: BigInt): BigInt {
	if (liquidationType == PARTY_A_LIQUIDATION_TYPE_LATE) {
		if (lockedCva.isZero()) return quoteCva
		return quoteCva.minus(quoteCva.times(deficit).div(lockedCva))
	}
	if (liquidationType == PARTY_A_LIQUIDATION_TYPE_OVERDUE) return BigInt.zero()
	return quoteCva
}

function shouldWriteSettlementBalance(current: BigInt | null, next: BigInt, preserveExistingNonZero: boolean): boolean {
	if (!preserveExistingNonZero) return true
	if (current === null) return true
	return !current.gt(BigInt.zero()) || next.gt(BigInt.zero())
}

export function applyPartyASettlementBalanceData(
	entity: LiquidationDetail,
	data: PartyASettlementBalanceData,
	preserveExistingNonZero: boolean,
): void {
	if (data.reimbursement !== null && shouldWriteSettlementBalance(entity.reimbursement, data.reimbursement!, preserveExistingNonZero)) {
		entity.reimbursement = data.reimbursement
	}
	if (data.deferredBalance !== null && shouldWriteSettlementBalance(entity.deferredBalance, data.deferredBalance!, preserveExistingNonZero)) {
		entity.deferredBalance = data.deferredBalance
	}
	if (data.liquidationEscrow !== null && shouldWriteSettlementBalance(entity.liquidationEscrow, data.liquidationEscrow!, preserveExistingNonZero)) {
		entity.liquidationEscrow = data.liquidationEscrow
	}
}

export function getPositiveSettlementReserveContribution(version: Version, mode: string, actualAmount: BigInt): BigInt {
	if (actualAmount.le(BigInt.zero())) return BigInt.zero()
	if (version >= Version.v_0_8_6 || mode == "cross") return actualAmount
	return BigInt.zero()
}

export function clearPendingSettlementSnapshotsForTakeover(entity: LiquidationDetail): void {
	let partyBs = copyBytesArray(entity.settlementPartyBs)
	let actualAmounts = copyBigIntArray(entity.settlementActualAmounts)
	let cvaReturnedAmounts = copyBigIntArray(entity.settlementCvaReturned)
	let reserveContributions = copyBigIntArray(entity.settlementReserveContributions)
	let states = copyStringArray(entity.settlementStates)

	let length = partyBs.length
	ensureBigIntLength(actualAmounts, length)
	ensureBigIntLength(cvaReturnedAmounts, length)
	ensureBigIntLength(reserveContributions, length)
	ensureStringLength(states, length, "pending")

	let paidCva = BigInt.zero()
	for (let i = 0; i < length; i++) {
		reserveContributions[i] = BigInt.zero()
		if (states[i] == "pending" || states[i] == "takeover-cleared") {
			actualAmounts[i] = BigInt.zero()
			cvaReturnedAmounts[i] = BigInt.zero()
			states[i] = "takeover-cleared"
		} else if (states[i] == "settled") {
			paidCva = paidCva.plus(cvaReturnedAmounts[i])
		}
	}

	entity.settlementActualAmounts = actualAmounts
	entity.settlementCvaReturned = cvaReturnedAmounts
	entity.settlementReserveContributions = reserveContributions
	entity.settlementStates = states
	entity.paidCva = paidCva
	entity.involvedPartyBCounts = BigInt.zero()
}

export function overrideSettlementAmount(version: Version, entity: LiquidationDetail, partyB: Bytes, actualAmount: BigInt): void {
	let partyBs = copyBytesArray(entity.settlementPartyBs)
	let index = findSettlementIndex(partyBs, partyB)
	if (index == -1) return

	let modes = copyStringArray(entity.settlementModes)
	let actualAmounts = copyBigIntArray(entity.settlementActualAmounts)
	let reserveContributions = copyBigIntArray(entity.settlementReserveContributions)
	let length = partyBs.length
	ensureStringLength(modes, length, "isolated")
	ensureBigIntLength(actualAmounts, length)
	ensureBigIntLength(reserveContributions, length)

	actualAmounts[index] = actualAmount
	reserveContributions[index] = getPositiveSettlementReserveContribution(version, modes[index], actualAmount)

	entity.settlementActualAmounts = actualAmounts
	entity.settlementReserveContributions = reserveContributions
}

export function upsertSettlementSnapshot(
	version: Version,
	entity: LiquidationDetail,
	partyB: Bytes,
	mode: string,
	expectedAmount: BigInt,
	actualAmount: BigInt,
	cvaReturned: BigInt,
	state: string,
	replaceActual: boolean,
): void {
	let partyBs = copyBytesArray(entity.settlementPartyBs)
	let modes = copyStringArray(entity.settlementModes)
	let expectedAmounts = copyBigIntArray(entity.settlementExpectedAmounts)
	let actualAmounts = copyBigIntArray(entity.settlementActualAmounts)
	let cvaReturnedAmounts = copyBigIntArray(entity.settlementCvaReturned)
	let reserveContributions = copyBigIntArray(entity.settlementReserveContributions)
	let states = copyStringArray(entity.settlementStates)

	let index = findSettlementIndex(partyBs, partyB)
	if (index == -1) {
		index = partyBs.length
		partyBs.push(partyB)
	}

	let length = partyBs.length
	ensureStringLength(modes, length, "isolated")
	ensureBigIntLength(expectedAmounts, length)
	ensureBigIntLength(actualAmounts, length)
	ensureBigIntLength(cvaReturnedAmounts, length)
	ensureBigIntLength(reserveContributions, length)
	ensureStringLength(states, length, "pending")

	modes[index] = mode
	if (replaceActual) {
		actualAmounts[index] = actualAmount
		if (version >= Version.v_0_8_6) cvaReturnedAmounts[index] = cvaReturned
	} else {
		expectedAmounts[index] = expectedAmounts[index].plus(expectedAmount)
		actualAmounts[index] = actualAmounts[index].plus(actualAmount)
		cvaReturnedAmounts[index] = cvaReturnedAmounts[index].plus(cvaReturned)
	}
	reserveContributions[index] = state == "pending" ? getPositiveSettlementReserveContribution(version, mode, actualAmounts[index]) : BigInt.zero()
	states[index] = state

	entity.settlementPartyBs = partyBs
	entity.settlementModes = modes
	entity.settlementExpectedAmounts = expectedAmounts
	entity.settlementActualAmounts = actualAmounts
	entity.settlementCvaReturned = cvaReturnedAmounts
	entity.settlementReserveContributions = reserveContributions
	entity.settlementStates = states
}
