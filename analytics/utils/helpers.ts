import {BigInt, Bytes, ethereum} from "@graphprotocol/graph-ts";
import {Account, OpenInterest} from "../../generated/schema";
import {
	getAlreadyCreatedConfiguration,
	getDailyHistoryForTimestamp,
	getDailySymbolTradesHistory,
	getDailyUserHistoryForTimestamp,
	getMonthlyHistoryForTimestamp,
	getOpenInterest,
	getSolverDailyHistoryForTimestamp,
	getSolverOpenInterest,
	getSymbolTradeHistory,
	getTotalHistory,
	getTotalSymbolTradesHistory,
	getTotalUserHistory,
	getUserActivity,
	getWeeklyHistoryForTimestamp
} from "./builders";
import {isSameDay, isSameMonth, isSameWeek} from "./time";
import {Version} from "../../common/BaseHandler";

export function unDecimal(value: BigInt): BigInt {
	return value.div(BigInt.fromString("10").pow(18))
}

const SECONDS_IN_DAY = BigInt.fromI32(86400)

export function updateDailyOpenInterest(
	blockTimestamp: BigInt,
	value: BigInt,
	increase: boolean,
	solver: Account,
	accountSource: Bytes | null
): void {
	let affiliateOI: OpenInterest = getOpenInterest(blockTimestamp, accountSource);
	let solverOI: OpenInterest = getSolverOpenInterest(blockTimestamp, solver.account);

	// Process affiliate open interest
	processOpenInterest(
		affiliateOI,
		blockTimestamp,
		value,
		increase,
		accountSource,
		false // isSolver is false
		// solverAccount defaults to null
	);

	// Process solver open interest
	processOpenInterest(
		solverOI,
		blockTimestamp,
		value,
		increase,
		accountSource,
		true, // isSolver is true
		solver.account // Pass solverAccount
	);
}

function startOfDayTimestamp(timestamp: BigInt): BigInt {
	return timestamp.div(SECONDS_IN_DAY).times(SECONDS_IN_DAY);
}

function endOfDayTimestamp(timestamp: BigInt): BigInt {
	let dayStart = startOfDayTimestamp(timestamp);
	return dayStart.plus(SECONDS_IN_DAY).minus(BigInt.fromI32(1));
}

function getDayNumber(timestamp: BigInt): BigInt {
	return timestamp.div(SECONDS_IN_DAY);
}

function diffInSeconds(end: BigInt, start: BigInt): BigInt {
	return end.minus(start);
}

function processOpenInterest(
	openInterest: OpenInterest,
	blockTimestamp: BigInt,
	value: BigInt,
	increase: boolean,
	accountSource: Bytes | null,
	isSolver: boolean,
	solverAccount: Bytes | null = null
): void {
	let lastUpdateTimestamp = openInterest.timestamp;
	let currentTimestamp = blockTimestamp;

	let currentAmount = openInterest.amount;

	let processingTimestamp = lastUpdateTimestamp;

	let done = false;

	while (!done) {
		let processingDayNumber = getDayNumber(processingTimestamp);

		let lastDay = getDayNumber(currentTimestamp).equals(processingDayNumber)
		let firstDay = getDayNumber(lastUpdateTimestamp).equals(processingDayNumber);

		done = lastDay
		let dailyOpenInterest = BigInt.zero()

		if (firstDay && !lastDay) {
			let firstIntervalStart = startOfDayTimestamp(processingTimestamp);
			let firstIntervalEnd = processingTimestamp;

			let secondIntervalStart = processingTimestamp;
			let secondIntervalEnd = endOfDayTimestamp(processingTimestamp);

			let firstInterval = diffInSeconds(firstIntervalEnd, firstIntervalStart);
			let secondInterval = diffInSeconds(secondIntervalEnd, secondIntervalStart);
			let totalInterval = diffInSeconds(secondIntervalEnd, firstIntervalStart);

			// Calculate the day's accumulated amount
			let accumulatedFirstPart = openInterest.weightedAmount;
			let accumulatedSecondPart = secondInterval.times(currentAmount);

			dailyOpenInterest = (accumulatedFirstPart.plus(accumulatedSecondPart)).div(totalInterval);
			openInterest.weightedAmount = BigInt.zero()
		} else if (!firstDay && !lastDay) {
			dailyOpenInterest = currentAmount
			openInterest.weightedAmount = BigInt.zero()
		} else if (!firstDay && lastDay) {
			processingTimestamp = currentTimestamp;
			let firstIntervalStart = startOfDayTimestamp(processingTimestamp);
			let firstIntervalEnd = processingTimestamp;

			let secondIntervalStart = processingTimestamp;
			let secondIntervalEnd = endOfDayTimestamp(processingTimestamp);

			let firstInterval = diffInSeconds(firstIntervalEnd, firstIntervalStart);
			let secondInterval = diffInSeconds(secondIntervalEnd, secondIntervalStart);
			let totalInterval = diffInSeconds(secondIntervalEnd, firstIntervalStart);

			// Calculate the day's accumulated amount
			let accumulatedFirstPart = firstInterval.times(currentAmount);
			let accumulatedSecondPart = secondInterval.times(increase ? currentAmount.plus(value) : currentAmount.minus(value));

			dailyOpenInterest = (accumulatedFirstPart.plus(accumulatedSecondPart)).div(totalInterval);
			openInterest.weightedAmount = accumulatedFirstPart
		} else if (firstDay && lastDay) {
			processingTimestamp = lastUpdateTimestamp
			let firstIntervalStart = startOfDayTimestamp(processingTimestamp);
			let firstIntervalEnd = processingTimestamp;

			let secondIntervalStart = processingTimestamp;
			let secondIntervalEnd = currentTimestamp;

			let thirdIntervalStart = currentTimestamp;
			let thirdIntervalEnd = endOfDayTimestamp(processingTimestamp);

			let firstInterval = diffInSeconds(firstIntervalEnd, firstIntervalStart);
			let secondInterval = diffInSeconds(secondIntervalEnd, secondIntervalStart);
			let thirdInterval = diffInSeconds(thirdIntervalEnd, thirdIntervalStart);
			let totalInterval = diffInSeconds(thirdIntervalEnd, firstIntervalStart);

			// Calculate the day's accumulated amount
			let accumulatedFirstPart = openInterest.weightedAmount;
			let accumulatedSecondPart = secondInterval.times(currentAmount);
			let accumulatedThirdPart = thirdInterval.times(increase ? currentAmount.plus(value) : currentAmount.minus(value));

			dailyOpenInterest = (accumulatedFirstPart.plus(accumulatedSecondPart).plus(accumulatedThirdPart)).div(totalInterval);
			openInterest.weightedAmount = accumulatedFirstPart.plus(accumulatedSecondPart)
		}

		if (isSolver) {
			let dailyHistory = getSolverDailyHistoryForTimestamp(processingTimestamp, solverAccount!, accountSource);
			dailyHistory.openInterest = dailyOpenInterest;
			dailyHistory.updateTimestamp = processingTimestamp;
			dailyHistory.save();
		} else {
			let dailyHistory = getDailyHistoryForTimestamp(processingTimestamp, accountSource);
			dailyHistory.openInterest = dailyOpenInterest;
			dailyHistory.updateTimestamp = processingTimestamp;
			dailyHistory.save();
		}

		// Move to the next day
		processingTimestamp = processingTimestamp.plus(SECONDS_IN_DAY);

	}

	openInterest.timestamp = currentTimestamp;
	openInterest.amount = increase ? currentAmount.plus(value) : currentAmount.minus(value);
	openInterest.save();
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
	version: Version;
	event: ethereum.Event;
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

	constructor(version: Version, account: Account, solver: Account | null, event: ethereum.Event, accountSource: Bytes | null = Bytes.empty()) {
		this.version = version;
		this.account = account;
		this.solver = solver;
		if (accountSource === null || accountSource == Bytes.empty() || accountSource.length == 0)
			accountSource = account.accountSource
		this.accountSource = accountSource;
		this.timestamp = event.block.timestamp;
		this.event = event
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

	const th = getTotalHistory(timestamp, account.accountSource, getAlreadyCreatedConfiguration(params.event, params.version).collateral)
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