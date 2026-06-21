import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
	Account,
	DailyAccountOwnerHistory,
	DailySubAccountHistory,
	DailyVirtualAccountHistory,
	Quote,
	SubAccount,
	TotalAccountOwnerHistory,
	TotalSubAccountHistory,
	TotalVirtualAccountHistory,
	VirtualAccount,
} from "../../../generated/schema"
import {
	getAlreadyCreatedConfiguration,
	getDailyAccountOwnerHistoryForTimestamp,
	getDailyHistoryForTimestamp,
	getDailySubAccountHistoryForTimestamp,
	getDailySymbolTradesHistory,
	getDailyUserHistoryForTimestamp,
	getDailyVirtualAccountHistoryForTimestamp,
	getSolverDailyHistoryForTimestamp,
	getSolverOnlyDailyHistoryForTimestamp,
	getSymbolTradeHistory,
	getTotalAccountOwnerHistory,
	getTotalHistory,
	getTotalSolverHistory,
	getTotalSubAccountHistory,
	getTotalSymbolTradesHistory,
	getTotalUserHistory,
	getTotalVirtualAccountHistory,
} from "./builders"
import { Version } from "../../common/BaseHandler"
import { getSymmioShare } from "./feeCollectorHelper"

export class UpdateHistoriesParams {
	version: Version
	event: ethereum.Event
	account: Account
	solver: Account | null
	accountSource: Bytes | null
	source: Bytes
	timestamp: BigInt
	_openTradeVolume: BigInt = BigInt.zero()
	_closeTradeVolume: BigInt = BigInt.zero()
	_liquidateTradeVolume: BigInt = BigInt.zero()
	_symbolId: BigInt = BigInt.zero()
	_openFee: BigInt = BigInt.zero()
	_closeFee: BigInt = BigInt.zero()
	_allocate: BigInt = BigInt.zero()
	_deallocate: BigInt = BigInt.zero()
	_deposit: BigInt = BigInt.zero()
	_withdraw: BigInt = BigInt.zero()
	_quotesCount: BigInt = BigInt.zero()
	_fundingPaid: BigInt = BigInt.zero()
	_fundingReceived: BigInt = BigInt.zero()
	_loss: BigInt = BigInt.zero()
	_profit: BigInt = BigInt.zero()
	_cvaPaid: BigInt = BigInt.zero()
	_lfPaid: BigInt = BigInt.zero()
	_positionsCount: BigInt = BigInt.zero()
	_symbolTradesCount: BigInt = BigInt.fromI32(1)

	constructor(version: Version, account: Account, solver: Account | null, event: ethereum.Event, accountSource: Bytes | null = Bytes.empty()) {
		this.version = version
		this.account = account
		this.solver = solver
		if (accountSource === null || accountSource == Bytes.empty() || accountSource.length == 0) accountSource = account.accountSource
		this.accountSource = accountSource
		this.timestamp = event.block.timestamp
		this.event = event
		this.source = event.address
	}

	openTradeVolume(openTradeVolume: BigInt): UpdateHistoriesParams {
		this._openTradeVolume = openTradeVolume
		return this
	}

	closeTradeVolume(closeTradeVolume: BigInt): UpdateHistoriesParams {
		this._closeTradeVolume = closeTradeVolume
		return this
	}

	liquidateTradeVolume(liquidateTradeVolume: BigInt): UpdateHistoriesParams {
		this._liquidateTradeVolume = liquidateTradeVolume
		return this
	}

	positionsCount(positionsCount: BigInt): UpdateHistoriesParams {
		this._positionsCount = positionsCount
		return this
	}

	symbolId(symbolId: BigInt): UpdateHistoriesParams {
		this._symbolId = symbolId
		return this
	}

	symbolTradesCount(symbolTradesCount: BigInt): UpdateHistoriesParams {
		this._symbolTradesCount = symbolTradesCount
		return this
	}

	openFee(openFee: BigInt): UpdateHistoriesParams {
		this._openFee = openFee
		return this
	}

	closeFee(closeFee: BigInt): UpdateHistoriesParams {
		this._closeFee = closeFee
		return this
	}

	allocate(allocate: BigInt): UpdateHistoriesParams {
		this._allocate = allocate
		return this
	}

	deallocate(deallocate: BigInt): UpdateHistoriesParams {
		this._deallocate = deallocate
		return this
	}

	deposit(deposit: BigInt): UpdateHistoriesParams {
		this._deposit = deposit
		return this
	}

	withdraw(withdraw: BigInt): UpdateHistoriesParams {
		this._withdraw = withdraw
		return this
	}

	quotesCount(quotesCount: BigInt): UpdateHistoriesParams {
		this._quotesCount = quotesCount
		return this
	}

	fundingPaid(fundingPaid: BigInt): UpdateHistoriesParams {
		this._fundingPaid = fundingPaid
		return this
	}

	fundingReceived(fundingReceived: BigInt): UpdateHistoriesParams {
		this._fundingReceived = fundingReceived
		return this
	}

	loss(loss: BigInt): UpdateHistoriesParams {
		this._loss = loss
		return this
	}

	profit(profit: BigInt): UpdateHistoriesParams {
		this._profit = profit
		return this
	}

	cvaPaid(cvaPaid: BigInt): UpdateHistoriesParams {
		this._cvaPaid = cvaPaid
		return this
	}

	lfPaid(lfPaid: BigInt): UpdateHistoriesParams {
		this._lfPaid = lfPaid
		return this
	}
}

export function updateHistories(params: UpdateHistoriesParams): void {
	const account = params.account
	const timestamp = params.timestamp
	const openTradeVolume = params._openTradeVolume
	const closeTradeVolume = params._closeTradeVolume
	const liquidateTradeVolume = params._liquidateTradeVolume
	const tradeVolume = openTradeVolume.plus(closeTradeVolume).plus(liquidateTradeVolume)

	const totalFee = params._openFee.plus(params._closeFee)

	const dh = getDailyHistoryForTimestamp(timestamp, params.accountSource, params.source)
	dh.tradeVolume = dh.tradeVolume.plus(tradeVolume)
	dh.openTradeVolume = dh.openTradeVolume.plus(openTradeVolume)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(closeTradeVolume)
	dh.liquidateTradeVolume = dh.liquidateTradeVolume.plus(liquidateTradeVolume)
	dh.platformFee = dh.platformFee.plus(totalFee)
	dh.openFee = dh.openFee.plus(params._openFee)
	dh.closeFee = dh.closeFee.plus(params._closeFee)
	dh.symmioShare = dh.symmioShare.plus(getSymmioShare(params.accountSource, totalFee))
	dh.allocate = dh.allocate.plus(params._allocate)
	dh.deallocate = dh.deallocate.plus(params._deallocate)
	dh.deposit = dh.deposit.plus(params._deposit)
	dh.withdraw = dh.withdraw.plus(params._withdraw)
	dh.quotesCount = dh.quotesCount.plus(params._quotesCount)
	dh.fundingPaid = dh.fundingPaid.plus(params._fundingPaid)
	dh.fundingReceived = dh.fundingReceived.plus(params._fundingReceived)
	if (params._positionsCount.gt(BigInt.zero())) {
		dh.averagePositionSize = dh.averagePositionSize.times(dh.positionsCount).plus(openTradeVolume).div(params._positionsCount.plus(dh.positionsCount))
		dh.positionsCount = dh.positionsCount.plus(params._positionsCount)
	}
	dh.updateTimestamp = timestamp
	dh.save()

	if (params.solver) {
		const sdh = getSolverDailyHistoryForTimestamp(timestamp, params.solver!.account, params.accountSource, params.source)
		sdh.tradeVolume = sdh.tradeVolume.plus(tradeVolume)
		sdh.openTradeVolume = sdh.openTradeVolume.plus(openTradeVolume)
		sdh.closeTradeVolume = sdh.closeTradeVolume.plus(closeTradeVolume)
		sdh.liquidateTradeVolume = sdh.liquidateTradeVolume.plus(liquidateTradeVolume)
		sdh.fundingPaid = sdh.fundingPaid.plus(params._fundingPaid)
		sdh.fundingReceived = sdh.fundingReceived.plus(params._fundingReceived)
		sdh.platformFee = sdh.platformFee.plus(totalFee)
		sdh.openFee = sdh.openFee.plus(params._openFee)
		sdh.closeFee = sdh.closeFee.plus(params._closeFee)
		if (params._positionsCount.gt(BigInt.zero())) {
			sdh.averagePositionSize = sdh.averagePositionSize
				.times(sdh.positionsCount)
				.plus(openTradeVolume)
				.div(params._positionsCount.plus(sdh.positionsCount))
			sdh.positionsCount = sdh.positionsCount.plus(params._positionsCount)
		}
		sdh.updateTimestamp = timestamp
		sdh.save()

		const sodh = getSolverOnlyDailyHistoryForTimestamp(timestamp, params.solver!.account, params.source)
		sodh.tradeVolume = sodh.tradeVolume.plus(tradeVolume)
		sodh.openTradeVolume = sodh.openTradeVolume.plus(openTradeVolume)
		sodh.closeTradeVolume = sodh.closeTradeVolume.plus(closeTradeVolume)
		sodh.liquidateTradeVolume = sodh.liquidateTradeVolume.plus(liquidateTradeVolume)
		sodh.fundingPaid = sodh.fundingPaid.plus(params._fundingPaid)
		sodh.fundingReceived = sodh.fundingReceived.plus(params._fundingReceived)
		sodh.platformFee = sodh.platformFee.plus(totalFee)
		sodh.openFee = sodh.openFee.plus(params._openFee)
		sodh.closeFee = sodh.closeFee.plus(params._closeFee)
		if (params._positionsCount.gt(BigInt.zero())) {
			sodh.averagePositionSize = sodh.averagePositionSize
				.times(sodh.positionsCount)
				.plus(openTradeVolume)
				.div(params._positionsCount.plus(sodh.positionsCount))
			sodh.positionsCount = sodh.positionsCount.plus(params._positionsCount)
		}
		sodh.updateTimestamp = timestamp
		sodh.save()

		const tsh = getTotalSolverHistory(timestamp, params.solver!.account, params.accountSource, params.source)
		tsh.tradeVolume = tsh.tradeVolume.plus(tradeVolume)
		tsh.openTradeVolume = tsh.openTradeVolume.plus(openTradeVolume)
		tsh.closeTradeVolume = tsh.closeTradeVolume.plus(closeTradeVolume)
		tsh.liquidateTradeVolume = tsh.liquidateTradeVolume.plus(liquidateTradeVolume)
		tsh.fundingPaid = tsh.fundingPaid.plus(params._fundingPaid)
		tsh.fundingReceived = tsh.fundingReceived.plus(params._fundingReceived)
		if (params._positionsCount.gt(BigInt.zero())) {
			tsh.averagePositionSize = tsh.averagePositionSize
				.times(tsh.positionsCount)
				.plus(openTradeVolume)
				.div(params._positionsCount.plus(tsh.positionsCount))
			tsh.positionsCount = tsh.positionsCount.plus(params._positionsCount)
		}
		tsh.updateTimestamp = timestamp
		tsh.save()
	}

	const th = getTotalHistory(timestamp, params.accountSource, getAlreadyCreatedConfiguration(params.event, params.version).collateral, params.source)
	th.tradeVolume = th.tradeVolume.plus(tradeVolume)
	th.openTradeVolume = th.openTradeVolume.plus(openTradeVolume)
	th.closeTradeVolume = th.closeTradeVolume.plus(closeTradeVolume)
	th.liquidateTradeVolume = th.liquidateTradeVolume.plus(liquidateTradeVolume)
	th.platformFee = th.platformFee.plus(totalFee)
	th.openFee = th.openFee.plus(params._openFee)
	th.closeFee = th.closeFee.plus(params._closeFee)
	th.allocate = th.allocate.plus(params._allocate)
	th.deallocate = th.deallocate.plus(params._deallocate)
	th.deposit = th.deposit.plus(params._deposit)
	th.withdraw = th.withdraw.plus(params._withdraw)
	th.quotesCount = th.quotesCount.plus(params._quotesCount)
	th.fundingPaid = th.fundingPaid.plus(params._fundingPaid)
	th.fundingReceived = th.fundingReceived.plus(params._fundingReceived)
	th.updateTimestamp = timestamp
	th.save()

	const duh = getDailyUserHistoryForTimestamp(timestamp, account)
	duh.openTradeVolume = duh.openTradeVolume.plus(openTradeVolume)
	duh.closeTradeVolume = duh.closeTradeVolume.plus(closeTradeVolume)
	duh.liquidateTradeVolume = duh.liquidateTradeVolume.plus(liquidateTradeVolume)
	duh.platformFeePaid = duh.platformFeePaid.plus(totalFee)
	duh.openFeePaid = duh.openFeePaid.plus(params._openFee)
	duh.closeFeePaid = duh.closeFeePaid.plus(params._closeFee)
	duh.allocate = duh.allocate.plus(params._allocate)
	duh.accAllocate = duh.accAllocate.plus(params._allocate)
	duh.deallocate = duh.deallocate.plus(params._deallocate)
	duh.accDeallocate = duh.accDeallocate.plus(params._deallocate)
	duh.deposit = duh.deposit.plus(params._deposit)
	duh.withdraw = duh.withdraw.plus(params._withdraw)
	duh.quotesCount = duh.quotesCount.plus(params._quotesCount)
	duh.fundingPaid = duh.fundingPaid.plus(params._fundingPaid)
	duh.fundingReceived = duh.fundingReceived.plus(params._fundingReceived)
	duh.loss = duh.loss.plus(params._loss)
	duh.profit = duh.profit.plus(params._profit)
	duh.cvaPaid = duh.cvaPaid.plus(params._cvaPaid)
	duh.lfPaid = duh.lfPaid.plus(params._lfPaid)
	duh.updateTimestamp = timestamp
	duh.save()

	const tuh = getTotalUserHistory(timestamp, account)
	tuh.openTradeVolume = tuh.openTradeVolume.plus(openTradeVolume)
	tuh.closeTradeVolume = tuh.closeTradeVolume.plus(closeTradeVolume)
	tuh.liquidateTradeVolume = tuh.liquidateTradeVolume.plus(liquidateTradeVolume)
	tuh.platformFeePaid = tuh.platformFeePaid.plus(totalFee)
	tuh.openFeePaid = tuh.openFeePaid.plus(params._openFee)
	tuh.closeFeePaid = tuh.closeFeePaid.plus(params._closeFee)
	tuh.allocate = tuh.allocate.plus(params._allocate)
	tuh.deallocate = tuh.deallocate.plus(params._deallocate)
	tuh.deposit = tuh.deposit.plus(params._deposit)
	tuh.withdraw = tuh.withdraw.plus(params._withdraw)
	tuh.quotesCount = tuh.quotesCount.plus(params._quotesCount)
	tuh.fundingPaid = tuh.fundingPaid.plus(params._fundingPaid)
	tuh.fundingReceived = tuh.fundingReceived.plus(params._fundingReceived)
	tuh.loss = tuh.loss.plus(params._loss)
	tuh.profit = tuh.profit.plus(params._profit)
	tuh.updateTimestamp = timestamp
	tuh.save()

	updateHierarchyHistories(params, tradeVolume, openTradeVolume, closeTradeVolume, liquidateTradeVolume, totalFee)

	if (params._symbolId.gt(BigInt.zero())) {
		let stv = getSymbolTradeHistory(params._symbolId, timestamp, params.accountSource, params.source)
		stv.volume = stv.volume.plus(tradeVolume)
		stv.updateTimestamp = timestamp
		stv.save()

		const dst = getDailySymbolTradesHistory(timestamp, account.account, params.accountSource, params._symbolId, params.source)
		dst.volume = dst.volume.plus(tradeVolume)
		dst.totalTrades = dst.totalTrades.plus(params._symbolTradesCount)
		dst.platformFeePaid = dst.platformFeePaid.plus(totalFee)
		dst.openFeePaid = dst.openFeePaid.plus(params._openFee)
		dst.closeFeePaid = dst.closeFeePaid.plus(params._closeFee)
		dst.fundingPaid = dst.fundingPaid.plus(params._fundingPaid)
		dst.fundingReceived = dst.fundingReceived.plus(params._fundingReceived)
		dst.loss = dst.loss.plus(params._loss)
		dst.profit = dst.profit.plus(params._profit)
		dst.updateTimestamp = timestamp
		dst.save()

		const tst = getTotalSymbolTradesHistory(timestamp, account.account, params.accountSource, params._symbolId, params.source)
		tst.volume = tst.volume.plus(tradeVolume)
		tst.totalTrades = tst.totalTrades.plus(params._symbolTradesCount)
		tst.platformFeePaid = tst.platformFeePaid.plus(totalFee)
		tst.openFeePaid = tst.openFeePaid.plus(params._openFee)
		tst.closeFeePaid = tst.closeFeePaid.plus(params._closeFee)
		tst.fundingPaid = tst.fundingPaid.plus(params._fundingPaid)
		tst.fundingReceived = tst.fundingReceived.plus(params._fundingReceived)
		tst.loss = tst.loss.plus(params._loss)
		tst.profit = tst.profit.plus(params._profit)
		tst.updateTimestamp = timestamp
		tst.save()
	}
}

function updateSubAccountHistories(
	params: UpdateHistoriesParams,
	sub: SubAccount,
	tradeVolume: BigInt,
	openTradeVolume: BigInt,
	closeTradeVolume: BigInt,
	liquidateTradeVolume: BigInt,
	totalFee: BigInt,
): void {
	const dh = getDailySubAccountHistoryForTimestamp(params.timestamp, sub)
	const th = getTotalSubAccountHistory(params.timestamp, sub)

	dh.openTradeVolume = dh.openTradeVolume.plus(openTradeVolume)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(closeTradeVolume)
	dh.liquidateTradeVolume = dh.liquidateTradeVolume.plus(liquidateTradeVolume)
	dh.platformFeePaid = dh.platformFeePaid.plus(totalFee)
	dh.openFeePaid = dh.openFeePaid.plus(params._openFee)
	dh.closeFeePaid = dh.closeFeePaid.plus(params._closeFee)
	dh.deposit = dh.deposit.plus(params._deposit)
	dh.withdraw = dh.withdraw.plus(params._withdraw)
	dh.allocate = dh.allocate.plus(params._allocate)
	dh.deallocate = dh.deallocate.plus(params._deallocate)
	dh.quotesCount = dh.quotesCount.plus(params._quotesCount)
	dh.fundingPaid = dh.fundingPaid.plus(params._fundingPaid)
	dh.fundingReceived = dh.fundingReceived.plus(params._fundingReceived)
	dh.loss = dh.loss.plus(params._loss)
	dh.profit = dh.profit.plus(params._profit)
	dh.activePositions = sub.activePositions
	dh.updateTimestamp = params.timestamp
	dh.save()

	th.openTradeVolume = th.openTradeVolume.plus(openTradeVolume)
	th.closeTradeVolume = th.closeTradeVolume.plus(closeTradeVolume)
	th.liquidateTradeVolume = th.liquidateTradeVolume.plus(liquidateTradeVolume)
	th.platformFeePaid = th.platformFeePaid.plus(totalFee)
	th.openFeePaid = th.openFeePaid.plus(params._openFee)
	th.closeFeePaid = th.closeFeePaid.plus(params._closeFee)
	th.deposit = th.deposit.plus(params._deposit)
	th.withdraw = th.withdraw.plus(params._withdraw)
	th.allocate = th.allocate.plus(params._allocate)
	th.deallocate = th.deallocate.plus(params._deallocate)
	th.quotesCount = th.quotesCount.plus(params._quotesCount)
	th.fundingPaid = th.fundingPaid.plus(params._fundingPaid)
	th.fundingReceived = th.fundingReceived.plus(params._fundingReceived)
	th.loss = th.loss.plus(params._loss)
	th.profit = th.profit.plus(params._profit)
	th.activePositions = sub.activePositions
	th.updateTimestamp = params.timestamp
	th.save()
}

function updateVirtualAccountHistories(
	params: UpdateHistoriesParams,
	va: VirtualAccount,
	sub: SubAccount,
	tradeVolume: BigInt,
	openTradeVolume: BigInt,
	closeTradeVolume: BigInt,
	liquidateTradeVolume: BigInt,
	totalFee: BigInt,
): void {
	const dh = getDailyVirtualAccountHistoryForTimestamp(params.timestamp, va, sub)
	const th = getTotalVirtualAccountHistory(params.timestamp, va, sub)

	dh.openTradeVolume = dh.openTradeVolume.plus(openTradeVolume)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(closeTradeVolume)
	dh.liquidateTradeVolume = dh.liquidateTradeVolume.plus(liquidateTradeVolume)
	dh.platformFeePaid = dh.platformFeePaid.plus(totalFee)
	dh.openFeePaid = dh.openFeePaid.plus(params._openFee)
	dh.closeFeePaid = dh.closeFeePaid.plus(params._closeFee)
	dh.deposit = dh.deposit.plus(params._deposit)
	dh.withdraw = dh.withdraw.plus(params._withdraw)
	dh.allocate = dh.allocate.plus(params._allocate)
	dh.deallocate = dh.deallocate.plus(params._deallocate)
	dh.quotesCount = dh.quotesCount.plus(params._quotesCount)
	dh.fundingPaid = dh.fundingPaid.plus(params._fundingPaid)
	dh.fundingReceived = dh.fundingReceived.plus(params._fundingReceived)
	dh.loss = dh.loss.plus(params._loss)
	dh.profit = dh.profit.plus(params._profit)
	dh.activePositions = va.activePositions
	dh.updateTimestamp = params.timestamp
	dh.save()

	th.openTradeVolume = th.openTradeVolume.plus(openTradeVolume)
	th.closeTradeVolume = th.closeTradeVolume.plus(closeTradeVolume)
	th.liquidateTradeVolume = th.liquidateTradeVolume.plus(liquidateTradeVolume)
	th.platformFeePaid = th.platformFeePaid.plus(totalFee)
	th.openFeePaid = th.openFeePaid.plus(params._openFee)
	th.closeFeePaid = th.closeFeePaid.plus(params._closeFee)
	th.deposit = th.deposit.plus(params._deposit)
	th.withdraw = th.withdraw.plus(params._withdraw)
	th.allocate = th.allocate.plus(params._allocate)
	th.deallocate = th.deallocate.plus(params._deallocate)
	th.quotesCount = th.quotesCount.plus(params._quotesCount)
	th.fundingPaid = th.fundingPaid.plus(params._fundingPaid)
	th.fundingReceived = th.fundingReceived.plus(params._fundingReceived)
	th.loss = th.loss.plus(params._loss)
	th.profit = th.profit.plus(params._profit)
	th.activePositions = va.activePositions
	th.updateTimestamp = params.timestamp
	th.save()
}

function updateAccountOwnerHistories(
	params: UpdateHistoriesParams,
	sub: SubAccount,
	openTradeVolume: BigInt,
	closeTradeVolume: BigInt,
	liquidateTradeVolume: BigInt,
	totalFee: BigInt,
): void {
	const dh = getDailyAccountOwnerHistoryForTimestamp(params.timestamp, sub)
	const th = getTotalAccountOwnerHistory(params.timestamp, sub)

	dh.openTradeVolume = dh.openTradeVolume.plus(openTradeVolume)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(closeTradeVolume)
	dh.liquidateTradeVolume = dh.liquidateTradeVolume.plus(liquidateTradeVolume)
	dh.platformFeePaid = dh.platformFeePaid.plus(totalFee)
	dh.openFeePaid = dh.openFeePaid.plus(params._openFee)
	dh.closeFeePaid = dh.closeFeePaid.plus(params._closeFee)
	dh.deposit = dh.deposit.plus(params._deposit)
	dh.withdraw = dh.withdraw.plus(params._withdraw)
	dh.allocate = dh.allocate.plus(params._allocate)
	dh.deallocate = dh.deallocate.plus(params._deallocate)
	dh.openedPositionsCount = dh.openedPositionsCount.plus(params._positionsCount)
	dh.fundingPaid = dh.fundingPaid.plus(params._fundingPaid)
	dh.fundingReceived = dh.fundingReceived.plus(params._fundingReceived)
	dh.loss = dh.loss.plus(params._loss)
	dh.profit = dh.profit.plus(params._profit)
	dh.updateTimestamp = params.timestamp
	dh.save()

	th.openTradeVolume = th.openTradeVolume.plus(openTradeVolume)
	th.closeTradeVolume = th.closeTradeVolume.plus(closeTradeVolume)
	th.liquidateTradeVolume = th.liquidateTradeVolume.plus(liquidateTradeVolume)
	th.platformFeePaid = th.platformFeePaid.plus(totalFee)
	th.openFeePaid = th.openFeePaid.plus(params._openFee)
	th.closeFeePaid = th.closeFeePaid.plus(params._closeFee)
	th.deposit = th.deposit.plus(params._deposit)
	th.withdraw = th.withdraw.plus(params._withdraw)
	th.allocate = th.allocate.plus(params._allocate)
	th.deallocate = th.deallocate.plus(params._deallocate)
	th.openedPositionsCount = th.openedPositionsCount.plus(params._positionsCount)
	th.fundingPaid = th.fundingPaid.plus(params._fundingPaid)
	th.fundingReceived = th.fundingReceived.plus(params._fundingReceived)
	th.loss = th.loss.plus(params._loss)
	th.profit = th.profit.plus(params._profit)
	th.updateTimestamp = params.timestamp
	th.save()
}

function updateHierarchyHistories(
	params: UpdateHistoriesParams,
	tradeVolume: BigInt,
	openTradeVolume: BigInt,
	closeTradeVolume: BigInt,
	liquidateTradeVolume: BigInt,
	totalFee: BigInt,
): void {
	if (!params.account.subAccount) return
	const sub = SubAccount.load(params.account.subAccount!)
	if (!sub) return
	updateSubAccountHistories(params, sub, tradeVolume, openTradeVolume, closeTradeVolume, liquidateTradeVolume, totalFee)
	updateAccountOwnerHistories(params, sub, openTradeVolume, closeTradeVolume, liquidateTradeVolume, totalFee)

	if (!params.account.virtualAccount) return
	const va = VirtualAccount.load(params.account.virtualAccount!)
	if (!va) return
	updateVirtualAccountHistories(params, va, sub, tradeVolume, openTradeVolume, closeTradeVolume, liquidateTradeVolume, totalFee)
}

function addNonNegative(value: BigInt, delta: BigInt): BigInt {
	let next = value.plus(delta)
	return next.lt(BigInt.zero()) ? BigInt.zero() : next
}

export function updateWithdrawHierarchyHistories(
	account: Account,
	timestamp: BigInt,
	withdrawRequestsDelta: BigInt,
	activeWithdrawRequestsDelta: BigInt,
	finalizedWithdrawRequestsDelta: BigInt,
	pendingWithdrawAmountDelta: BigInt,
): void {
	if (!account.subAccount) return
	const sub = SubAccount.load(account.subAccount!)
	if (!sub) return

	const sdh = getDailySubAccountHistoryForTimestamp(timestamp, sub)
	const sth = getTotalSubAccountHistory(timestamp, sub)
	sdh.withdrawRequestsCount = sdh.withdrawRequestsCount.plus(withdrawRequestsDelta)
	sdh.activeWithdrawRequestsCount = addNonNegative(sdh.activeWithdrawRequestsCount, activeWithdrawRequestsDelta)
	sdh.finalizedWithdrawRequestsCount = sdh.finalizedWithdrawRequestsCount.plus(finalizedWithdrawRequestsDelta)
	sdh.pendingWithdrawAmount = addNonNegative(sdh.pendingWithdrawAmount, pendingWithdrawAmountDelta)
	sdh.updateTimestamp = timestamp
	sdh.save()
	sth.withdrawRequestsCount = sth.withdrawRequestsCount.plus(withdrawRequestsDelta)
	sth.activeWithdrawRequestsCount = addNonNegative(sth.activeWithdrawRequestsCount, activeWithdrawRequestsDelta)
	sth.finalizedWithdrawRequestsCount = sth.finalizedWithdrawRequestsCount.plus(finalizedWithdrawRequestsDelta)
	sth.pendingWithdrawAmount = addNonNegative(sth.pendingWithdrawAmount, pendingWithdrawAmountDelta)
	sth.updateTimestamp = timestamp
	sth.save()

	const odh = getDailyAccountOwnerHistoryForTimestamp(timestamp, sub)
	const oth = getTotalAccountOwnerHistory(timestamp, sub)
	odh.withdrawRequestsCount = odh.withdrawRequestsCount.plus(withdrawRequestsDelta)
	odh.activeWithdrawRequestsCount = addNonNegative(odh.activeWithdrawRequestsCount, activeWithdrawRequestsDelta)
	odh.finalizedWithdrawRequestsCount = odh.finalizedWithdrawRequestsCount.plus(finalizedWithdrawRequestsDelta)
	odh.pendingWithdrawAmount = addNonNegative(odh.pendingWithdrawAmount, pendingWithdrawAmountDelta)
	odh.updateTimestamp = timestamp
	odh.save()
	oth.withdrawRequestsCount = oth.withdrawRequestsCount.plus(withdrawRequestsDelta)
	oth.activeWithdrawRequestsCount = addNonNegative(oth.activeWithdrawRequestsCount, activeWithdrawRequestsDelta)
	oth.finalizedWithdrawRequestsCount = oth.finalizedWithdrawRequestsCount.plus(finalizedWithdrawRequestsDelta)
	oth.pendingWithdrawAmount = addNonNegative(oth.pendingWithdrawAmount, pendingWithdrawAmountDelta)
	oth.updateTimestamp = timestamp
	oth.save()

	if (!account.virtualAccount) return
	const va = VirtualAccount.load(account.virtualAccount!)
	if (!va) return
	const vdh = getDailyVirtualAccountHistoryForTimestamp(timestamp, va, sub)
	const vth = getTotalVirtualAccountHistory(timestamp, va, sub)
	vdh.withdrawRequestsCount = vdh.withdrawRequestsCount.plus(withdrawRequestsDelta)
	vdh.activeWithdrawRequestsCount = addNonNegative(vdh.activeWithdrawRequestsCount, activeWithdrawRequestsDelta)
	vdh.finalizedWithdrawRequestsCount = vdh.finalizedWithdrawRequestsCount.plus(finalizedWithdrawRequestsDelta)
	vdh.pendingWithdrawAmount = addNonNegative(vdh.pendingWithdrawAmount, pendingWithdrawAmountDelta)
	vdh.updateTimestamp = timestamp
	vdh.save()
	vth.withdrawRequestsCount = vth.withdrawRequestsCount.plus(withdrawRequestsDelta)
	vth.activeWithdrawRequestsCount = addNonNegative(vth.activeWithdrawRequestsCount, activeWithdrawRequestsDelta)
	vth.finalizedWithdrawRequestsCount = vth.finalizedWithdrawRequestsCount.plus(finalizedWithdrawRequestsDelta)
	vth.pendingWithdrawAmount = addNonNegative(vth.pendingWithdrawAmount, pendingWithdrawAmountDelta)
	vth.updateTimestamp = timestamp
	vth.save()
}

export function updateMarginHierarchyHistories(
	sub: SubAccount,
	va: VirtualAccount | null,
	timestamp: BigInt,
	marginAdd: BigInt,
	marginRemove: BigInt,
): void {
	const sdh = getDailySubAccountHistoryForTimestamp(timestamp, sub)
	const sth = getTotalSubAccountHistory(timestamp, sub)
	sdh.marginAdd = sdh.marginAdd.plus(marginAdd)
	sdh.marginRemove = sdh.marginRemove.plus(marginRemove)
	sdh.updateTimestamp = timestamp
	sdh.save()
	sth.marginAdd = sth.marginAdd.plus(marginAdd)
	sth.marginRemove = sth.marginRemove.plus(marginRemove)
	sth.updateTimestamp = timestamp
	sth.save()

	if (!va) return
	const vdh = getDailyVirtualAccountHistoryForTimestamp(timestamp, va, sub)
	const vth = getTotalVirtualAccountHistory(timestamp, va, sub)
	vdh.marginAdd = vdh.marginAdd.plus(marginAdd)
	vdh.marginRemove = vdh.marginRemove.plus(marginRemove)
	vdh.updateTimestamp = timestamp
	vdh.save()
	vth.marginAdd = vth.marginAdd.plus(marginAdd)
	vth.marginRemove = vth.marginRemove.plus(marginRemove)
	vth.updateTimestamp = timestamp
	vth.save()
}

function applyQuoteBucketDeltasToOwnerHistory(
	dh: DailyAccountOwnerHistory,
	th: TotalAccountOwnerHistory,
	pendingDelta: BigInt,
	openDelta: BigInt,
	closedDelta: BigInt,
	liquidatedDelta: BigInt,
	cancelledDelta: BigInt,
	expiredDelta: BigInt,
	rejectedDelta: BigInt,
	timestamp: BigInt,
): void {
	dh.pendingQuotesCount = addNonNegative(dh.pendingQuotesCount, pendingDelta)
	dh.openPositionsCount = addNonNegative(dh.openPositionsCount, openDelta)
	dh.closedPositionsCount = dh.closedPositionsCount.plus(closedDelta)
	dh.liquidatedPositionsCount = dh.liquidatedPositionsCount.plus(liquidatedDelta)
	dh.cancelledQuotesCount = dh.cancelledQuotesCount.plus(cancelledDelta)
	dh.expiredQuotesCount = dh.expiredQuotesCount.plus(expiredDelta)
	dh.rejectedQuotesCount = dh.rejectedQuotesCount.plus(rejectedDelta)
	dh.updateTimestamp = timestamp
	dh.save()
	th.pendingQuotesCount = addNonNegative(th.pendingQuotesCount, pendingDelta)
	th.openPositionsCount = addNonNegative(th.openPositionsCount, openDelta)
	th.closedPositionsCount = th.closedPositionsCount.plus(closedDelta)
	th.liquidatedPositionsCount = th.liquidatedPositionsCount.plus(liquidatedDelta)
	th.cancelledQuotesCount = th.cancelledQuotesCount.plus(cancelledDelta)
	th.expiredQuotesCount = th.expiredQuotesCount.plus(expiredDelta)
	th.rejectedQuotesCount = th.rejectedQuotesCount.plus(rejectedDelta)
	th.updateTimestamp = timestamp
	th.save()
}

function applyQuoteBucketDeltasToSubHistory(
	dh: DailySubAccountHistory,
	th: TotalSubAccountHistory,
	pendingDelta: BigInt,
	openDelta: BigInt,
	closedDelta: BigInt,
	liquidatedDelta: BigInt,
	cancelledDelta: BigInt,
	expiredDelta: BigInt,
	rejectedDelta: BigInt,
	timestamp: BigInt,
): void {
	dh.pendingQuotesCount = addNonNegative(dh.pendingQuotesCount, pendingDelta)
	dh.openPositionsCount = addNonNegative(dh.openPositionsCount, openDelta)
	dh.closedQuotesCount = dh.closedQuotesCount.plus(closedDelta)
	dh.liquidatedQuotesCount = dh.liquidatedQuotesCount.plus(liquidatedDelta)
	dh.cancelledQuotesCount = dh.cancelledQuotesCount.plus(cancelledDelta)
	dh.expiredQuotesCount = dh.expiredQuotesCount.plus(expiredDelta)
	dh.rejectedQuotesCount = dh.rejectedQuotesCount.plus(rejectedDelta)
	dh.updateTimestamp = timestamp
	dh.save()
	th.pendingQuotesCount = addNonNegative(th.pendingQuotesCount, pendingDelta)
	th.openPositionsCount = addNonNegative(th.openPositionsCount, openDelta)
	th.closedQuotesCount = th.closedQuotesCount.plus(closedDelta)
	th.liquidatedQuotesCount = th.liquidatedQuotesCount.plus(liquidatedDelta)
	th.cancelledQuotesCount = th.cancelledQuotesCount.plus(cancelledDelta)
	th.expiredQuotesCount = th.expiredQuotesCount.plus(expiredDelta)
	th.rejectedQuotesCount = th.rejectedQuotesCount.plus(rejectedDelta)
	th.updateTimestamp = timestamp
	th.save()
}

function applyQuoteBucketDeltasToVirtualHistory(
	dh: DailyVirtualAccountHistory,
	th: TotalVirtualAccountHistory,
	pendingDelta: BigInt,
	openDelta: BigInt,
	closedDelta: BigInt,
	liquidatedDelta: BigInt,
	cancelledDelta: BigInt,
	expiredDelta: BigInt,
	rejectedDelta: BigInt,
	timestamp: BigInt,
): void {
	dh.pendingQuotesCount = addNonNegative(dh.pendingQuotesCount, pendingDelta)
	dh.openPositionsCount = addNonNegative(dh.openPositionsCount, openDelta)
	dh.closedQuotesCount = dh.closedQuotesCount.plus(closedDelta)
	dh.liquidatedQuotesCount = dh.liquidatedQuotesCount.plus(liquidatedDelta)
	dh.cancelledQuotesCount = dh.cancelledQuotesCount.plus(cancelledDelta)
	dh.expiredQuotesCount = dh.expiredQuotesCount.plus(expiredDelta)
	dh.rejectedQuotesCount = dh.rejectedQuotesCount.plus(rejectedDelta)
	dh.updateTimestamp = timestamp
	dh.save()
	th.pendingQuotesCount = addNonNegative(th.pendingQuotesCount, pendingDelta)
	th.openPositionsCount = addNonNegative(th.openPositionsCount, openDelta)
	th.closedQuotesCount = th.closedQuotesCount.plus(closedDelta)
	th.liquidatedQuotesCount = th.liquidatedQuotesCount.plus(liquidatedDelta)
	th.cancelledQuotesCount = th.cancelledQuotesCount.plus(cancelledDelta)
	th.expiredQuotesCount = th.expiredQuotesCount.plus(expiredDelta)
	th.rejectedQuotesCount = th.rejectedQuotesCount.plus(rejectedDelta)
	th.updateTimestamp = timestamp
	th.save()
}

export function updateQuoteBucketHierarchyHistories(
	sub: SubAccount,
	va: VirtualAccount | null,
	timestamp: BigInt,
	pendingDelta: BigInt,
	openDelta: BigInt,
	closedDelta: BigInt,
	liquidatedDelta: BigInt,
	cancelledDelta: BigInt,
	expiredDelta: BigInt,
	rejectedDelta: BigInt,
): void {
	applyQuoteBucketDeltasToSubHistory(
		getDailySubAccountHistoryForTimestamp(timestamp, sub),
		getTotalSubAccountHistory(timestamp, sub),
		pendingDelta,
		openDelta,
		closedDelta,
		liquidatedDelta,
		cancelledDelta,
		expiredDelta,
		rejectedDelta,
		timestamp,
	)
	applyQuoteBucketDeltasToOwnerHistory(
		getDailyAccountOwnerHistoryForTimestamp(timestamp, sub),
		getTotalAccountOwnerHistory(timestamp, sub),
		pendingDelta,
		openDelta,
		closedDelta,
		liquidatedDelta,
		cancelledDelta,
		expiredDelta,
		rejectedDelta,
		timestamp,
	)
	if (!va) return
	applyQuoteBucketDeltasToVirtualHistory(
		getDailyVirtualAccountHistoryForTimestamp(timestamp, va, sub),
		getTotalVirtualAccountHistory(timestamp, va, sub),
		pendingDelta,
		openDelta,
		closedDelta,
		liquidatedDelta,
		cancelledDelta,
		expiredDelta,
		rejectedDelta,
		timestamp,
	)
}

export function updateQuoteBucketHierarchyHistoriesForQuote(
	quote: Quote,
	timestamp: BigInt,
	pendingDelta: BigInt,
	openDelta: BigInt,
	closedDelta: BigInt,
	liquidatedDelta: BigInt,
	cancelledDelta: BigInt,
	expiredDelta: BigInt,
	rejectedDelta: BigInt,
): void {
	if (!quote.subAccount) return
	const sub = SubAccount.load(quote.subAccount!)
	if (!sub) return
	let va: VirtualAccount | null = null
	if (quote.virtualAccount) va = VirtualAccount.load(quote.virtualAccount!)
	updateQuoteBucketHierarchyHistories(
		sub,
		va,
		timestamp,
		pendingDelta,
		openDelta,
		closedDelta,
		liquidatedDelta,
		cancelledDelta,
		expiredDelta,
		rejectedDelta,
	)
}
