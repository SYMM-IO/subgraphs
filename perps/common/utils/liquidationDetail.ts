import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../generated/schema"
import { PartyASettlementBalanceData } from "../VersionedQuoteLoader"

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

export function calculateDeferredBalanceAtStart(allocatedBalance: BigInt, liquidationAllocatedBalance: BigInt): BigInt {
	if (allocatedBalance.le(liquidationAllocatedBalance)) return BigInt.zero()
	return allocatedBalance.minus(liquidationAllocatedBalance)
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

export function getPositiveCrossReserveContribution(mode: string, actualAmount: BigInt): BigInt {
	if (mode != "cross" || actualAmount.le(BigInt.zero())) return BigInt.zero()
	return actualAmount
}

export function upsertSettlementSnapshot(
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
	} else {
		expectedAmounts[index] = expectedAmounts[index].plus(expectedAmount)
		actualAmounts[index] = actualAmounts[index].plus(actualAmount)
		cvaReturnedAmounts[index] = cvaReturnedAmounts[index].plus(cvaReturned)
	}
	reserveContributions[index] = getPositiveCrossReserveContribution(mode, actualAmounts[index])
	states[index] = state

	entity.settlementPartyBs = partyBs
	entity.settlementModes = modes
	entity.settlementExpectedAmounts = expectedAmounts
	entity.settlementActualAmounts = actualAmounts
	entity.settlementCvaReturned = cvaReturnedAmounts
	entity.settlementReserveContributions = reserveContributions
	entity.settlementStates = states
}
