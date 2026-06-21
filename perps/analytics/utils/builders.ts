import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import {
	Account,
	Configuration,
	DailyAccountOwnerHistory,
	DailyHistory,
	DailySymbolTradesHistory,
	DailySubAccountHistory,
	DailyUserHistory,
	DailyVirtualAccountHistory,
	MonthlyHistory,
	OpenInterest,
	SolverDailyHistory,
	SolverOnlyDailyHistory,
	SubAccount,
	SymbolTradeHistory,
	TotalHistory,
	TotalAccountOwnerHistory,
	TotalSolverHistory,
	TotalSymbolTradesHistory,
	TotalSubAccountHistory,
	TotalUserHistory,
	TotalVirtualAccountHistory,
	UserActivity,
	VirtualAccount,
	WeeklyHistory,
} from "../../../generated/schema"
import { getDayNumber, startOfDay, startOfMonth, startOfWeek } from "./time"
import { Version } from "../../common/BaseHandler"
import { getCollateral as getCollateral_0_8_5 } from "../../common/contract_utils_0_8_5"
import { getCollateral as getCollateral_0_8_4 } from "../../common/contract_utils_0_8_4"
import { getCollateral as getCollateral_0_8_3 } from "../../common/contract_utils_0_8_3"
import { getCollateral as getCollateral_0_8_2 } from "../../common/contract_utils_0_8_2"
import { getCollateral as getCollateral_0_8_1 } from "../../common/contract_utils_0_8_1"
import { getCollateral as getCollateral_0_8_0 } from "../../common/contract_utils_0_8_0"
import { ZERO_ADDRESS, ZERO_ADDRESS_BYTES } from "./constants"

export function getDailyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null, source: Bytes): DailyHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id = dateStr + "_" + source.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let dh = DailyHistory.load(id)
	if (dh == null) {
		dh = new DailyHistory(id)
		dh.day = getDayNumber(timestamp)
		dh.updateTimestamp = timestamp
		dh.timestamp = timestamp
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.quotesCount = BigInt.zero()
		dh.tradeVolume = BigInt.zero()
		dh.openTradeVolume = BigInt.zero()
		dh.closeTradeVolume = BigInt.zero()
		dh.liquidateTradeVolume = BigInt.zero()
		dh.allocate = BigInt.zero()
		dh.deallocate = BigInt.zero()
		dh.newUsers = BigInt.zero()
		dh.activeUsers = BigInt.zero()
		dh.newAccounts = BigInt.zero()
		dh.platformFee = BigInt.zero()
		dh.openFee = BigInt.zero()
		dh.closeFee = BigInt.zero()
		dh.symmioShare = BigInt.zero()
		dh.openInterest = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.positionsCount = BigInt.zero()
		dh.averagePositionSize = BigInt.zero()
		dh.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		dh.source = source
		dh.save()
	}
	return dh
}

export function getSolverDailyHistoryForTimestamp(timestamp: BigInt, solver: Bytes, accountSource: Bytes | null, source: Bytes): SolverDailyHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id =
		dateStr + "_" + source.toHexString() + "_" + solver.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let sdh = SolverDailyHistory.load(id)
	if (sdh == null) {
		sdh = new SolverDailyHistory(id)
		sdh.day = getDayNumber(timestamp)
		sdh.updateTimestamp = timestamp
		sdh.timestamp = timestamp
		sdh.tradeVolume = BigInt.zero()
		sdh.openTradeVolume = BigInt.zero()
		sdh.closeTradeVolume = BigInt.zero()
		sdh.liquidateTradeVolume = BigInt.zero()
		sdh.openInterest = BigInt.zero()
		sdh.positionsCount = BigInt.zero()
		sdh.averagePositionSize = BigInt.zero()
		sdh.fundingPaid = BigInt.zero()
		sdh.fundingReceived = BigInt.zero()
		sdh.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		sdh.solver = solver
		sdh.platformFee = BigInt.zero()
		sdh.openFee = BigInt.zero()
		sdh.closeFee = BigInt.zero()
		sdh.source = source
		sdh.save()
	}
	return sdh
}

export function getSolverOnlyDailyHistoryForTimestamp(timestamp: BigInt, solver: Bytes, source: Bytes): SolverOnlyDailyHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id = dateStr + "_" + source.toHexString() + "_" + solver.toHexString()
	let sodh = SolverOnlyDailyHistory.load(id)
	if (sodh == null) {
		sodh = new SolverOnlyDailyHistory(id)
		sodh.day = getDayNumber(timestamp)
		sodh.updateTimestamp = timestamp
		sodh.timestamp = timestamp
		sodh.tradeVolume = BigInt.zero()
		sodh.openTradeVolume = BigInt.zero()
		sodh.closeTradeVolume = BigInt.zero()
		sodh.liquidateTradeVolume = BigInt.zero()
		sodh.openInterest = BigInt.zero()
		sodh.positionsCount = BigInt.zero()
		sodh.averagePositionSize = BigInt.zero()
		sodh.fundingPaid = BigInt.zero()
		sodh.fundingReceived = BigInt.zero()
		sodh.solver = solver
		sodh.platformFee = BigInt.zero()
		sodh.openFee = BigInt.zero()
		sodh.closeFee = BigInt.zero()
		sodh.source = source
		sodh.save()
	}
	return sodh
}

export function getTotalSolverHistory(timestamp: BigInt, solver: Bytes, accountSource: Bytes | null, source: Bytes): TotalSolverHistory {
	const id = solver.toHexString() + "_" + source.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let th = TotalSolverHistory.load(id)
	if (th == null) {
		th = new TotalSolverHistory(id)
		th.updateTimestamp = timestamp
		th.timestamp = timestamp
		th.tradeVolume = BigInt.zero()
		th.openTradeVolume = BigInt.zero()
		th.closeTradeVolume = BigInt.zero()
		th.liquidateTradeVolume = BigInt.zero()
		th.openInterest = BigInt.zero()
		th.positionsCount = BigInt.zero()
		th.averagePositionSize = BigInt.zero()
		th.fundingPaid = BigInt.zero()
		th.fundingReceived = BigInt.zero()
		th.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		th.solver = solver
		th.source = source
		th.save()
	}
	return th
}

export function getWeeklyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null, source: Bytes): WeeklyHistory {
	const dateStr = startOfWeek(timestamp).getTime().toString()
	const id = dateStr + "_" + source.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let wh = WeeklyHistory.load(id)
	if (wh == null) {
		wh = new WeeklyHistory(id)
		wh.timestamp = timestamp
		wh.tradeVolume = BigInt.zero()
		wh.activeUsers = BigInt.zero()
		wh.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		wh.source = source
		wh.save()
	}
	return wh
}

export function getMonthlyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null, source: Bytes): MonthlyHistory {
	const dateStr = startOfMonth(timestamp).getTime().toString()
	const id = dateStr + "_" + source.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let mh = MonthlyHistory.load(id)
	if (mh == null) {
		mh = new MonthlyHistory(id)
		mh.timestamp = timestamp
		mh.tradeVolume = BigInt.zero()
		mh.activeUsers = BigInt.zero()
		mh.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		mh.source = source
		mh.save()
	}
	return mh
}

export function getTotalHistory(timestamp: BigInt, accountSource: Bytes | null, collateral: Bytes, source: Bytes): TotalHistory {
	const id = source.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString()) + "_" + collateral.toHexString()
	let th = TotalHistory.load(id)
	if (th == null) {
		th = new TotalHistory(id)
		th.updateTimestamp = timestamp
		th.timestamp = timestamp
		th.deposit = BigInt.zero()
		th.withdraw = BigInt.zero()
		th.quotesCount = BigInt.zero()
		th.tradeVolume = BigInt.zero()
		th.openTradeVolume = BigInt.zero()
		th.closeTradeVolume = BigInt.zero()
		th.liquidateTradeVolume = BigInt.zero()
		th.allocate = BigInt.zero()
		th.deallocate = BigInt.zero()
		th.users = BigInt.zero()
		th.accounts = BigInt.zero()
		th.platformFee = BigInt.zero()
		th.openFee = BigInt.zero()
		th.closeFee = BigInt.zero()
		th.fundingReceived = BigInt.zero()
		th.fundingPaid = BigInt.zero()
		th.collateral = collateral
		th.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		th.source = source
		th.save()
	}
	return th
}

export function getSymbolTradeHistory(symbol: BigInt, timestamp: BigInt, accountSource: Bytes | null, source: Bytes): SymbolTradeHistory {
	const id = symbol.toString() + "_" + source.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let stv = SymbolTradeHistory.load(id)
	if (stv == null) {
		stv = new SymbolTradeHistory(id)
		stv.source = source
		stv.updateTimestamp = timestamp
		stv.timestamp = timestamp
		stv.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		stv.volume = BigInt.zero()
		stv.symbolId = symbol
		stv.save()
	}
	return stv
}

export function getDailySymbolTradesHistory(
	timestamp: BigInt,
	account: Bytes,
	accountSource: Bytes | null,
	symbolId: BigInt,
	source: Bytes,
): DailySymbolTradesHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id =
		dateStr +
		"_" +
		source.toHexString() +
		"_" +
		(accountSource === null ? ZERO_ADDRESS : accountSource.toHexString()) +
		"_" +
		account.toHexString() +
		"_" +
		symbolId.toString()

	let history = DailySymbolTradesHistory.load(id)

	if (history == null) {
		history = new DailySymbolTradesHistory(id)
		history.source = source
		history.day = getDayNumber(timestamp)
		history.updateTimestamp = timestamp
		history.account = account
		history.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		history.symbolId = symbolId
		history.totalTrades = BigInt.zero()
		history.fundingPaid = BigInt.zero()
		history.fundingReceived = BigInt.zero()
		history.platformFeePaid = BigInt.zero()
		history.openFeePaid = BigInt.zero()
		history.closeFeePaid = BigInt.zero()
		history.loss = BigInt.zero()
		history.profit = BigInt.zero()
		history.volume = BigInt.zero()
		history.save()
	}
	return history
}

export function getTotalSymbolTradesHistory(
	timestamp: BigInt,
	account: Bytes,
	accountSource: Bytes | null,
	symbolId: BigInt,
	source: Bytes,
): TotalSymbolTradesHistory {
	const id =
		source.toHexString() +
		"_" +
		(accountSource === null ? ZERO_ADDRESS : accountSource.toHexString()) +
		"_" +
		account.toHexString() +
		"_" +
		symbolId.toString()

	let history = TotalSymbolTradesHistory.load(id)

	if (history == null) {
		history = new TotalSymbolTradesHistory(id)
		history.source = source
		history.updateTimestamp = timestamp
		history.account = account
		history.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		history.symbolId = symbolId
		history.totalTrades = BigInt.zero()
		history.fundingPaid = BigInt.zero()
		history.fundingReceived = BigInt.zero()
		history.platformFeePaid = BigInt.zero()
		history.openFeePaid = BigInt.zero()
		history.closeFeePaid = BigInt.zero()
		history.loss = BigInt.zero()
		history.profit = BigInt.zero()
		history.volume = BigInt.zero()
		history.save()
	}
	return history
}

export function getDailyUserHistoryForTimestamp(timestamp: BigInt, account: Account): DailyUserHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id = dateStr + "_" + (account.accountSource === null ? ZERO_ADDRESS : account.accountSource!.toHexString()) + "_" + account.id
	let dh = DailyUserHistory.load(id)
	if (dh == null) {
		// get total history
		let th = getTotalUserHistory(timestamp, account)

		dh = new DailyUserHistory(id)
		dh.day = getDayNumber(timestamp)
		dh.updateTimestamp = timestamp
		dh.user = account.user
		dh.account = account.account
		dh.accountRef = account.id
		dh.timestamp = timestamp
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.quotesCount = BigInt.zero()
		dh.openTradeVolume = BigInt.zero()
		dh.closeTradeVolume = BigInt.zero()
		dh.liquidateTradeVolume = BigInt.zero()
		dh.allocate = BigInt.zero()
		dh.deallocate = BigInt.zero()
		dh.accAllocate = th.allocate // carry over from total history
		dh.accDeallocate = th.deallocate // carry over from total history
		dh.platformFeePaid = BigInt.zero()
		dh.openFeePaid = BigInt.zero()
		dh.closeFeePaid = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.loss = BigInt.zero()
		dh.profit = BigInt.zero()
		dh.cvaPaid = BigInt.zero()
		dh.lfPaid = BigInt.zero()
		dh.accountSource = account.accountSource === null ? ZERO_ADDRESS_BYTES : account.accountSource
		dh.save()
	}
	return dh
}

export function getTotalUserHistory(timestamp: BigInt, account: Account): TotalUserHistory {
	const id = (account.accountSource === null ? ZERO_ADDRESS : account.accountSource!.toHexString()) + "_" + account.id
	let th = TotalUserHistory.load(id)
	if (th == null) {
		th = new TotalUserHistory(id)
		th.updateTimestamp = timestamp
		th.timestamp = timestamp
		th.deposit = BigInt.zero()
		th.withdraw = BigInt.zero()
		th.quotesCount = BigInt.zero()
		th.openTradeVolume = BigInt.zero()
		th.closeTradeVolume = BigInt.zero()
		th.liquidateTradeVolume = BigInt.zero()
		th.allocate = BigInt.zero()
		th.deallocate = BigInt.zero()
		th.platformFeePaid = BigInt.zero()
		th.openFeePaid = BigInt.zero()
		th.closeFeePaid = BigInt.zero()
		th.fundingPaid = BigInt.zero()
		th.fundingReceived = BigInt.zero()
		th.loss = BigInt.zero()
		th.profit = BigInt.zero()
		th.account = account.account
		th.accountRef = account.id
		th.accountSource = account.accountSource === null ? ZERO_ADDRESS_BYTES : account.accountSource
		th.save()
	}
	return th
}

function initSubAccountHistoryTotals(entity: TotalSubAccountHistory, sub: SubAccount, timestamp: BigInt): void {
	entity.subAccount = sub.address
	entity.subAccountRef = sub.id
	entity.owner = sub.owner
	entity.source = sub.source
	entity.coreSource = sub.coreSource
	entity.accountLayerSource = sub.accountLayerSource
	entity.quotesCount = BigInt.zero()
	entity.pendingQuotesCount = BigInt.zero()
	entity.openPositionsCount = BigInt.zero()
	entity.closedQuotesCount = BigInt.zero()
	entity.liquidatedQuotesCount = BigInt.zero()
	entity.cancelledQuotesCount = BigInt.zero()
	entity.expiredQuotesCount = BigInt.zero()
	entity.rejectedQuotesCount = BigInt.zero()
	entity.liquidationsCount = BigInt.zero()
	entity.withdrawRequestsCount = BigInt.zero()
	entity.activeWithdrawRequestsCount = BigInt.zero()
	entity.finalizedWithdrawRequestsCount = BigInt.zero()
	entity.pendingWithdrawAmount = BigInt.zero()
	entity.openTradeVolume = BigInt.zero()
	entity.closeTradeVolume = BigInt.zero()
	entity.liquidateTradeVolume = BigInt.zero()
	entity.deposit = BigInt.zero()
	entity.withdraw = BigInt.zero()
	entity.allocate = BigInt.zero()
	entity.deallocate = BigInt.zero()
	entity.marginAdd = BigInt.zero()
	entity.marginRemove = BigInt.zero()
	entity.platformFeePaid = BigInt.zero()
	entity.openFeePaid = BigInt.zero()
	entity.closeFeePaid = BigInt.zero()
	entity.fundingPaid = BigInt.zero()
	entity.fundingReceived = BigInt.zero()
	entity.loss = BigInt.zero()
	entity.profit = BigInt.zero()
	entity.activePositions = BigInt.zero()
	entity.updateTimestamp = timestamp
	entity.timestamp = timestamp
}

function initAccountOwnerHistoryTotals(entity: TotalAccountOwnerHistory, sub: SubAccount, timestamp: BigInt): void {
	entity.owner = sub.owner
	entity.source = sub.source
	entity.coreSource = sub.coreSource
	entity.accountLayerSource = sub.accountLayerSource
	entity.pendingQuotesCount = BigInt.zero()
	entity.openedPositionsCount = BigInt.zero()
	entity.openPositionsCount = BigInt.zero()
	entity.closedPositionsCount = BigInt.zero()
	entity.liquidatedPositionsCount = BigInt.zero()
	entity.cancelledQuotesCount = BigInt.zero()
	entity.expiredQuotesCount = BigInt.zero()
	entity.rejectedQuotesCount = BigInt.zero()
	entity.withdrawRequestsCount = BigInt.zero()
	entity.activeWithdrawRequestsCount = BigInt.zero()
	entity.finalizedWithdrawRequestsCount = BigInt.zero()
	entity.pendingWithdrawAmount = BigInt.zero()
	entity.openTradeVolume = BigInt.zero()
	entity.closeTradeVolume = BigInt.zero()
	entity.liquidateTradeVolume = BigInt.zero()
	entity.deposit = BigInt.zero()
	entity.withdraw = BigInt.zero()
	entity.allocate = BigInt.zero()
	entity.deallocate = BigInt.zero()
	entity.platformFeePaid = BigInt.zero()
	entity.openFeePaid = BigInt.zero()
	entity.closeFeePaid = BigInt.zero()
	entity.fundingPaid = BigInt.zero()
	entity.fundingReceived = BigInt.zero()
	entity.loss = BigInt.zero()
	entity.profit = BigInt.zero()
	entity.updateTimestamp = timestamp
	entity.timestamp = timestamp
}

function getAccountOwnerHistoryId(sub: SubAccount): string {
	if (sub.coreSource === null) return sub.source.toHexString() + "_" + sub.owner.toHexString()
	return sub.source.toHexString() + "_" + sub.coreSource!.toHexString() + "_" + sub.owner.toHexString()
}

function initVirtualAccountHistoryTotals(entity: TotalVirtualAccountHistory, va: VirtualAccount, sub: SubAccount, timestamp: BigInt): void {
	entity.virtualAccount = va.address
	entity.virtualAccountRef = va.id
	entity.subAccount = sub.address
	entity.subAccountRef = sub.id
	entity.owner = sub.owner
	entity.source = va.source
	entity.coreSource = va.coreSource
	entity.accountLayerSource = va.accountLayerSource
	entity.symbolId = va.symbolId
	entity.isolationType = va.isolationType
	entity.quotesCount = BigInt.zero()
	entity.pendingQuotesCount = BigInt.zero()
	entity.openPositionsCount = BigInt.zero()
	entity.closedQuotesCount = BigInt.zero()
	entity.liquidatedQuotesCount = BigInt.zero()
	entity.cancelledQuotesCount = BigInt.zero()
	entity.expiredQuotesCount = BigInt.zero()
	entity.rejectedQuotesCount = BigInt.zero()
	entity.liquidationsCount = BigInt.zero()
	entity.withdrawRequestsCount = BigInt.zero()
	entity.activeWithdrawRequestsCount = BigInt.zero()
	entity.finalizedWithdrawRequestsCount = BigInt.zero()
	entity.pendingWithdrawAmount = BigInt.zero()
	entity.openTradeVolume = BigInt.zero()
	entity.closeTradeVolume = BigInt.zero()
	entity.liquidateTradeVolume = BigInt.zero()
	entity.deposit = BigInt.zero()
	entity.withdraw = BigInt.zero()
	entity.allocate = BigInt.zero()
	entity.deallocate = BigInt.zero()
	entity.marginAdd = BigInt.zero()
	entity.marginRemove = BigInt.zero()
	entity.platformFeePaid = BigInt.zero()
	entity.openFeePaid = BigInt.zero()
	entity.closeFeePaid = BigInt.zero()
	entity.fundingPaid = BigInt.zero()
	entity.fundingReceived = BigInt.zero()
	entity.loss = BigInt.zero()
	entity.profit = BigInt.zero()
	entity.activePositions = BigInt.zero()
	entity.updateTimestamp = timestamp
	entity.timestamp = timestamp
}

export function getDailySubAccountHistoryForTimestamp(timestamp: BigInt, sub: SubAccount): DailySubAccountHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id = dateStr + "_" + sub.id
	let dh = DailySubAccountHistory.load(id)
	if (dh == null) {
		dh = new DailySubAccountHistory(id)
		let th = getTotalSubAccountHistory(timestamp, sub)
		dh.day = getDayNumber(timestamp)
		dh.subAccount = th.subAccount
		dh.subAccountRef = th.subAccountRef
		dh.owner = th.owner
		dh.source = th.source
		dh.coreSource = th.coreSource
		dh.accountLayerSource = th.accountLayerSource
		dh.quotesCount = BigInt.zero()
		dh.pendingQuotesCount = BigInt.zero()
		dh.openPositionsCount = BigInt.zero()
		dh.closedQuotesCount = BigInt.zero()
		dh.liquidatedQuotesCount = BigInt.zero()
		dh.cancelledQuotesCount = BigInt.zero()
		dh.expiredQuotesCount = BigInt.zero()
		dh.rejectedQuotesCount = BigInt.zero()
		dh.liquidationsCount = BigInt.zero()
		dh.withdrawRequestsCount = BigInt.zero()
		dh.activeWithdrawRequestsCount = th.activeWithdrawRequestsCount
		dh.finalizedWithdrawRequestsCount = BigInt.zero()
		dh.pendingWithdrawAmount = th.pendingWithdrawAmount
		dh.openTradeVolume = BigInt.zero()
		dh.closeTradeVolume = BigInt.zero()
		dh.liquidateTradeVolume = BigInt.zero()
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.allocate = BigInt.zero()
		dh.deallocate = BigInt.zero()
		dh.marginAdd = BigInt.zero()
		dh.marginRemove = BigInt.zero()
		dh.platformFeePaid = BigInt.zero()
		dh.openFeePaid = BigInt.zero()
		dh.closeFeePaid = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.loss = BigInt.zero()
		dh.profit = BigInt.zero()
		dh.activePositions = th.activePositions
		dh.updateTimestamp = timestamp
		dh.timestamp = timestamp
		dh.save()
	}
	return dh
}

export function getTotalSubAccountHistory(timestamp: BigInt, sub: SubAccount): TotalSubAccountHistory {
	let th = TotalSubAccountHistory.load(sub.id)
	if (th == null) {
		th = new TotalSubAccountHistory(sub.id)
		initSubAccountHistoryTotals(th, sub, timestamp)
		th.save()
	}
	return th
}

export function getDailyAccountOwnerHistoryForTimestamp(timestamp: BigInt, sub: SubAccount): DailyAccountOwnerHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id = dateStr + "_" + getAccountOwnerHistoryId(sub)
	let dh = DailyAccountOwnerHistory.load(id)
	if (dh == null) {
		dh = new DailyAccountOwnerHistory(id)
		let th = getTotalAccountOwnerHistory(timestamp, sub)
		dh.day = getDayNumber(timestamp)
		dh.owner = th.owner
		dh.source = th.source
		dh.coreSource = th.coreSource
		dh.accountLayerSource = th.accountLayerSource
		dh.pendingQuotesCount = th.pendingQuotesCount
		dh.openedPositionsCount = BigInt.zero()
		dh.openPositionsCount = th.openPositionsCount
		dh.closedPositionsCount = BigInt.zero()
		dh.liquidatedPositionsCount = BigInt.zero()
		dh.cancelledQuotesCount = BigInt.zero()
		dh.expiredQuotesCount = BigInt.zero()
		dh.rejectedQuotesCount = BigInt.zero()
		dh.withdrawRequestsCount = BigInt.zero()
		dh.activeWithdrawRequestsCount = th.activeWithdrawRequestsCount
		dh.finalizedWithdrawRequestsCount = BigInt.zero()
		dh.pendingWithdrawAmount = th.pendingWithdrawAmount
		dh.openTradeVolume = BigInt.zero()
		dh.closeTradeVolume = BigInt.zero()
		dh.liquidateTradeVolume = BigInt.zero()
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.allocate = BigInt.zero()
		dh.deallocate = BigInt.zero()
		dh.platformFeePaid = BigInt.zero()
		dh.openFeePaid = BigInt.zero()
		dh.closeFeePaid = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.loss = BigInt.zero()
		dh.profit = BigInt.zero()
		dh.updateTimestamp = timestamp
		dh.timestamp = timestamp
		dh.save()
	}
	return dh
}

export function getTotalAccountOwnerHistory(timestamp: BigInt, sub: SubAccount): TotalAccountOwnerHistory {
	const id = getAccountOwnerHistoryId(sub)
	let th = TotalAccountOwnerHistory.load(id)
	if (th == null) {
		th = new TotalAccountOwnerHistory(id)
		initAccountOwnerHistoryTotals(th, sub, timestamp)
		th.save()
	}
	return th
}

export function getDailyVirtualAccountHistoryForTimestamp(timestamp: BigInt, va: VirtualAccount, sub: SubAccount): DailyVirtualAccountHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id = dateStr + "_" + va.id
	let dh = DailyVirtualAccountHistory.load(id)
	if (dh == null) {
		dh = new DailyVirtualAccountHistory(id)
		let th = getTotalVirtualAccountHistory(timestamp, va, sub)
		dh.day = getDayNumber(timestamp)
		dh.virtualAccount = th.virtualAccount
		dh.virtualAccountRef = th.virtualAccountRef
		dh.subAccount = th.subAccount
		dh.subAccountRef = th.subAccountRef
		dh.owner = th.owner
		dh.source = th.source
		dh.coreSource = th.coreSource
		dh.accountLayerSource = th.accountLayerSource
		dh.symbolId = th.symbolId
		dh.isolationType = th.isolationType
		dh.quotesCount = BigInt.zero()
		dh.pendingQuotesCount = BigInt.zero()
		dh.openPositionsCount = BigInt.zero()
		dh.closedQuotesCount = BigInt.zero()
		dh.liquidatedQuotesCount = BigInt.zero()
		dh.cancelledQuotesCount = BigInt.zero()
		dh.expiredQuotesCount = BigInt.zero()
		dh.rejectedQuotesCount = BigInt.zero()
		dh.liquidationsCount = BigInt.zero()
		dh.withdrawRequestsCount = BigInt.zero()
		dh.activeWithdrawRequestsCount = th.activeWithdrawRequestsCount
		dh.finalizedWithdrawRequestsCount = BigInt.zero()
		dh.pendingWithdrawAmount = th.pendingWithdrawAmount
		dh.openTradeVolume = BigInt.zero()
		dh.closeTradeVolume = BigInt.zero()
		dh.liquidateTradeVolume = BigInt.zero()
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.allocate = BigInt.zero()
		dh.deallocate = BigInt.zero()
		dh.marginAdd = BigInt.zero()
		dh.marginRemove = BigInt.zero()
		dh.platformFeePaid = BigInt.zero()
		dh.openFeePaid = BigInt.zero()
		dh.closeFeePaid = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.loss = BigInt.zero()
		dh.profit = BigInt.zero()
		dh.activePositions = th.activePositions
		dh.updateTimestamp = timestamp
		dh.timestamp = timestamp
		dh.save()
	}
	return dh
}

export function getTotalVirtualAccountHistory(timestamp: BigInt, va: VirtualAccount, sub: SubAccount): TotalVirtualAccountHistory {
	let th = TotalVirtualAccountHistory.load(va.id)
	if (th == null) {
		th = new TotalVirtualAccountHistory(va.id)
		initVirtualAccountHistoryTotals(th, va, sub, timestamp)
		th.save()
	}
	return th
}

export function getOpenInterest(timestamp: BigInt, accountSource: Bytes | null): OpenInterest {
	const id = "OpenInterest_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let oi = OpenInterest.load(id)
	if (oi == null) {
		oi = new OpenInterest(id)
		oi.amount = BigInt.zero()
		oi.weightedAmount = BigInt.zero()
		oi.timestamp = timestamp
		oi.save()
	}
	return oi
}

export function getSolverOpenInterest(timestamp: BigInt, accountSource: Bytes | null, solver: Bytes): OpenInterest {
	const id = "OpenInterest_" + solver.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let oi = OpenInterest.load(id)
	if (oi == null) {
		oi = new OpenInterest(id)
		oi.amount = BigInt.zero()
		oi.weightedAmount = BigInt.zero()
		oi.timestamp = timestamp
		oi.save()
	}
	return oi
}

export function getSolverOnlyOpenInterest(timestamp: BigInt, solver: Bytes): OpenInterest {
	const id = "OpenInterest_" + solver.toHexString()
	let oi = OpenInterest.load(id)
	if (oi == null) {
		oi = new OpenInterest(id)
		oi.amount = BigInt.zero()
		oi.weightedAmount = BigInt.zero()
		oi.timestamp = timestamp
		oi.save()
	}
	return oi
}

export function getUserActivity(user: Bytes, accountSource: Bytes | null, timestamp: BigInt): UserActivity {
	const id = user.toHexString() + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let ua = UserActivity.load(id)
	if (ua == null) {
		ua = new UserActivity(id)
		ua.user = user
		ua.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		ua.timestamp = timestamp
		ua.save()
	}
	return ua
}

export function getConfiguration(event: ethereum.Event): Configuration {
	let configuration = Configuration.load("0")
	if (configuration == null) {
		configuration = new Configuration("0")
		configuration.updateTimestamp = event.block.timestamp
		configuration.updateTransaction = event.transaction.hash
		configuration.collateral = event.address // Will be replaced shortly after creation
		configuration.save()
	}
	return configuration
}

export function getAlreadyCreatedConfiguration(event: ethereum.Event, version: Version): Configuration {
	let conf = Configuration.load("0")!
	if (conf.collateral == event.address) {
		let collateral: Bytes | null = null
		switch (version) {
			case Version.v_0_8_5: {
				collateral = getCollateral_0_8_5(event.address)
				break
			}
			case Version.v_0_8_4: {
				collateral = getCollateral_0_8_4(event.address)
				break
			}
			case Version.v_0_8_3: {
				collateral = getCollateral_0_8_3(event.address)
				break
			}
			case Version.v_0_8_2: {
				collateral = getCollateral_0_8_2(event.address)
				break
			}
			case Version.v_0_8_1: {
				collateral = getCollateral_0_8_1(event.address)
				break
			}
			case Version.v_0_8_0: {
				collateral = getCollateral_0_8_0(event.address)
				break
			}
		}
		if (collateral) {
			conf.collateral = collateral
			conf.save()
		}
	}
	return conf
}
