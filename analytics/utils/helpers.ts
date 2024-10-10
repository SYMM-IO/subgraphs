import {BigInt, Bytes} from "@graphprotocol/graph-ts";
import {Account} from "../../generated/schema";
import {
	getDailyHistoryForTimestamp,
	getDailySymbolTradesHistory,
	getDailyUserHistoryForTimestamp,
	getMonthlyHistoryForTimestamp,
	getOpenInterest,
	getSolverDailyHistoryForTimestamp,
	getSymbolTradeHistory,
	getTotalHistory,
	getTotalSymbolTradesHistory,
	getTotalUserHistory,
	getUserActivity,
	getWeeklyHistoryForTimestamp
} from "./builders";
import {isSameDay, isSameMonth, isSameWeek, startOfDay} from "./time";

export function unDecimal(value: BigInt): BigInt {
	return value.div(BigInt.fromString("10").pow(18))
}

export function diffInSeconds(timestamp1: BigInt, timestamp2: BigInt): BigInt {
	return timestamp1.minus(timestamp2)
}

export function updateDailyOpenInterest(blockTimestamp: BigInt, value: BigInt, increase: boolean, solver: Account, accountSource: Bytes | null): void {
	let oi = getOpenInterest(blockTimestamp, accountSource)
	let dh = getDailyHistoryForTimestamp(blockTimestamp, accountSource)
	let sdh = getSolverDailyHistoryForTimestamp(blockTimestamp, solver.account, accountSource)

	const sod = BigInt.fromString((startOfDay(blockTimestamp).getTime() / 1000).toString())

	if (isSameDay(blockTimestamp, oi.timestamp)) {
		oi.accumulatedAmount = oi.accumulatedAmount.plus(diffInSeconds(blockTimestamp, oi.timestamp).times(oi.amount))
		dh.openInterest = oi.accumulatedAmount.div(diffInSeconds(blockTimestamp, sod))
		sdh.openInterest = oi.accumulatedAmount.div(diffInSeconds(blockTimestamp, sod))
	} else {
		dh.openInterest = oi.accumulatedAmount.div(BigInt.fromString("86400"))
		sdh.openInterest = oi.accumulatedAmount.div(BigInt.fromString("86400"))
		oi.accumulatedAmount = diffInSeconds(blockTimestamp, sod).times(oi.amount)
	}
	oi.amount = increase ? oi.amount.plus(value) : oi.amount.minus(value)
	oi.timestamp = blockTimestamp
	dh.updateTimestamp = blockTimestamp
	sdh.updateTimestamp = blockTimestamp

	oi.save()
	dh.save()
	sdh.save()
}

export function updateActivityTimestamps(account: Account, timestamp: BigInt): void {
	account.lastActivityTimestamp = timestamp
	account.save()
	let ua = getUserActivity(account.user, account.accountSource, timestamp)
	let uaTimestamp = ua.updateTimestamp === null ? BigInt.zero() : ua.updateTimestamp!
	if (!isSameDay(timestamp, uaTimestamp)) {
		let dh = getDailyHistoryForTimestamp(timestamp, account.accountSource)
		dh.activeUsers = dh.activeUsers.plus(BigInt.fromString("1"))
		dh.save()
	}
	if (!isSameWeek(timestamp, uaTimestamp)) {
		let wh = getWeeklyHistoryForTimestamp(timestamp, account.accountSource)
		wh.activeUsers = wh.activeUsers.plus(BigInt.fromString("1"))
		wh.save()
	}
	if (!isSameMonth(timestamp, uaTimestamp)) {
		let mh = getMonthlyHistoryForTimestamp(timestamp, account.accountSource)
		mh.activeUsers = mh.activeUsers.plus(BigInt.fromString("1"))
		mh.save()
	}
	ua.updateTimestamp = timestamp
	ua.save()
}

export class UpdateHistoriesParams {
	account: Account;
	solver: Account | null;
	accountSource: Bytes | null;
	timestamp: BigInt;
	_openTradeVolume: BigInt = BigInt.zero();
	_closeTradeVolume: BigInt = BigInt.zero();
	_liquidateTradeVolume: BigInt = BigInt.zero();
	_symbolId: BigInt = BigInt.zero();
	_tradingFee: BigInt = BigInt.zero();
	_allocate: BigInt = BigInt.zero();
	_deallocate: BigInt = BigInt.zero();
	_deposit: BigInt = BigInt.zero();
	_withdraw: BigInt = BigInt.zero();
	_quotesCount: BigInt = BigInt.zero();
	_fundingPaid: BigInt = BigInt.zero();
	_fundingReceived: BigInt = BigInt.zero();
	_loss: BigInt = BigInt.zero();
	_profit: BigInt = BigInt.zero();
	_positionsCount: BigInt = BigInt.zero();

	constructor(account: Account, solver: Account | null, timestamp: BigInt, accountSource: Bytes | null = Bytes.empty()) {
		this.account = account;
		this.solver = solver;
		if (accountSource === null || accountSource == Bytes.empty() || accountSource.length == 0)
			accountSource = account.accountSource
		this.accountSource = accountSource;
		this.timestamp = timestamp;
	}

	openTradeVolume(openTradeVolume: BigInt): UpdateHistoriesParams {
		this._openTradeVolume = openTradeVolume;
		return this;
	}

	closeTradeVolume(closeTradeVolume: BigInt): UpdateHistoriesParams {
		this._closeTradeVolume = closeTradeVolume;
		return this;
	}

	liquidateTradeVolume(liquidateTradeVolume: BigInt): UpdateHistoriesParams {
		this._liquidateTradeVolume = liquidateTradeVolume;
		return this;
	}

	positionsCount(positionsCount: BigInt): UpdateHistoriesParams {
		this._positionsCount = positionsCount;
		return this;
	}

	symbolId(symbolId: BigInt): UpdateHistoriesParams {
		this._symbolId = symbolId;
		return this;
	}

	tradingFee(tradingFee: BigInt): UpdateHistoriesParams {
		this._tradingFee = tradingFee;
		return this;
	}

	allocate(allocate: BigInt): UpdateHistoriesParams {
		this._allocate = allocate;
		return this;
	}

	deallocate(deallocate: BigInt): UpdateHistoriesParams {
		this._deallocate = deallocate;
		return this;
	}

	deposit(deposit: BigInt): UpdateHistoriesParams {
		this._deposit = deposit;
		return this;
	}

	withdraw(withdraw: BigInt): UpdateHistoriesParams {
		this._withdraw = withdraw;
		return this;
	}

	quotesCount(quotesCount: BigInt): UpdateHistoriesParams {
		this._quotesCount = quotesCount;
		return this;
	}

	fundingPaid(fundingPaid: BigInt): UpdateHistoriesParams {
		this._fundingPaid = fundingPaid;
		return this;
	}

	fundingReceived(fundingReceived: BigInt): UpdateHistoriesParams {
		this._fundingReceived = fundingReceived;
		return this;
	}

	loss(loss: BigInt): UpdateHistoriesParams {
		this._loss = loss;
		return this;
	}

	profit(profit: BigInt): UpdateHistoriesParams {
		this._profit = profit;
		return this;
	}
}

export function updateHistories(params: UpdateHistoriesParams): void {
	const account = params.account;
	const timestamp = params.timestamp;
	const openTradeVolume = params._openTradeVolume;
	const closeTradeVolume = params._closeTradeVolume;
	const liquidateTradeVolume = params._liquidateTradeVolume;

	const dh = getDailyHistoryForTimestamp(timestamp, params.accountSource)
	dh.tradeVolume = dh.tradeVolume.plus(openTradeVolume.plus(closeTradeVolume).plus(liquidateTradeVolume))
	dh.openTradeVolume = dh.openTradeVolume.plus(openTradeVolume)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(closeTradeVolume)
	dh.liquidateTradeVolume = dh.liquidateTradeVolume.plus(liquidateTradeVolume)
	dh.platformFee = dh.platformFee.plus(params._tradingFee)
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

	if (params.solver != null) {
		const sdh = getSolverDailyHistoryForTimestamp(timestamp, params.solver!.account, params.accountSource)
		sdh.tradeVolume = sdh.tradeVolume.plus(openTradeVolume.plus(closeTradeVolume).plus(liquidateTradeVolume))
		sdh.openTradeVolume = sdh.openTradeVolume.plus(openTradeVolume)
		sdh.closeTradeVolume = sdh.closeTradeVolume.plus(closeTradeVolume)
		sdh.liquidateTradeVolume = sdh.liquidateTradeVolume.plus(liquidateTradeVolume)
		sdh.fundingPaid = sdh.fundingPaid.plus(params._fundingPaid)
		sdh.fundingReceived = sdh.fundingReceived.plus(params._fundingReceived)
		if (params._positionsCount.gt(BigInt.zero())) {
			sdh.averagePositionSize = sdh.averagePositionSize.times(sdh.positionsCount).plus(openTradeVolume).div(params._positionsCount.plus(sdh.positionsCount))
			sdh.positionsCount = sdh.positionsCount.plus(params._positionsCount)
		}
		sdh.updateTimestamp = timestamp
		sdh.save()
	}

	const th = getTotalHistory(timestamp, account.accountSource)
	th.tradeVolume = th.tradeVolume.plus(openTradeVolume.plus(closeTradeVolume).plus(liquidateTradeVolume))
	th.openTradeVolume = th.openTradeVolume.plus(openTradeVolume)
	th.closeTradeVolume = th.closeTradeVolume.plus(closeTradeVolume)
	th.liquidateTradeVolume = th.liquidateTradeVolume.plus(liquidateTradeVolume)
	th.platformFee = th.platformFee.plus(params._tradingFee)
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
	duh.platformFeePaid = duh.platformFeePaid.plus(params._tradingFee)
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
	duh.updateTimestamp = timestamp
	duh.save()

	const tuh = getTotalUserHistory(timestamp, account)
	tuh.openTradeVolume = tuh.openTradeVolume.plus(openTradeVolume)
	tuh.closeTradeVolume = tuh.closeTradeVolume.plus(closeTradeVolume)
	tuh.liquidateTradeVolume = tuh.liquidateTradeVolume.plus(liquidateTradeVolume)
	tuh.platformFeePaid = tuh.platformFeePaid.plus(params._tradingFee)
	tuh.allocate = tuh.allocate.plus(params._allocate)
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

	if (params._symbolId.gt(BigInt.zero())) {
		let stv = getSymbolTradeHistory(params._symbolId, timestamp, account.accountSource)
		stv.volume = stv.volume.plus(openTradeVolume.plus(closeTradeVolume).plus(liquidateTradeVolume))
		stv.updateTimestamp = timestamp
		stv.save()

		const dst = getDailySymbolTradesHistory(
			timestamp,
			account.account,
			account.accountSource,
			params._symbolId,
		)
		dst.totalTrades = dst.totalTrades.plus(BigInt.fromString("1"))
		dst.platformFeePaid = dst.platformFeePaid.plus(params._tradingFee)
		dst.fundingPaid = dst.fundingPaid.plus(params._fundingPaid)
		dst.fundingReceived = dst.fundingReceived.plus(params._fundingReceived)
		dst.updateTimestamp = timestamp
		dst.save()

		const tst = getTotalSymbolTradesHistory(
			timestamp,
			account.account,
			account.accountSource,
			params._symbolId,
		)
		tst.totalTrades = tst.totalTrades.plus(BigInt.fromString("1"))
		tst.platformFeePaid = tst.platformFeePaid.plus(params._tradingFee)
		tst.fundingPaid = tst.fundingPaid.plus(params._fundingPaid)
		tst.fundingReceived = tst.fundingReceived.plus(params._fundingReceived)
		tst.updateTimestamp = timestamp
		tst.save()
	}
}