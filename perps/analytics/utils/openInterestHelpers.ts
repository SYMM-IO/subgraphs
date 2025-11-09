import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Account, OpenInterest, OpenInterestSettleDay, SymmioEntity } from "../../../generated/schema";
import {
	getDailyHistoryForTimestamp,
	getOpenInterest,
	getSolverDailyHistoryForTimestamp,
	getSolverOnlyDailyHistoryForTimestamp,
	getSolverOnlyOpenInterest,
	getSolverOpenInterest,
} from "./builders"
import { diffInSeconds, endOfDayTimestamp, getDayNumber, SECONDS_IN_DAY, startOfDayTimestamp } from "./time"
import { AFFILIATES, SOLVERS } from "./constants";

export function updateDailyOpenInterest(
	blockTimestamp: BigInt,
	value: BigInt,
	increase: boolean,
	solver: Account,
	accountSource: Bytes | null,
	source: Bytes,
): void {
	let affiliateOI: OpenInterest = getOpenInterest(blockTimestamp, accountSource)
	let solverOI: OpenInterest = getSolverOpenInterest(blockTimestamp, accountSource, solver.account)
	let solverOnlyOI: OpenInterest = getSolverOnlyOpenInterest(blockTimestamp, solver.account)

	// Process affiliate open interest
	processOpenInterest(
		affiliateOI,
		blockTimestamp,
		value,
		increase,
		accountSource,
		source,
		0, // affiliate
		// solverAccount defaults to null
	)

	// Process solver open interest
	processOpenInterest(
		solverOI,
		blockTimestamp,
		value,
		increase,
		accountSource,
		source,
		1, // solver
		solver.account, // Pass solverAccount
	)

	// Process solver only open interest
	processOpenInterest(
		solverOnlyOI,
		blockTimestamp,
		value,
		increase,
		null,
		source,
		2, // solver only
		solver.account, // Pass solverAccount
	)
}

function processOpenInterest(
	openInterest: OpenInterest,
	blockTimestamp: BigInt,
	value: BigInt,
	increase: boolean,
	accountSource: Bytes | null,
	source: Bytes,
	isSolver: number,
	solverAccount: Bytes | null = null,
): void {
	let lastUpdateTimestamp = openInterest.timestamp
	let currentTimestamp = blockTimestamp

	let currentAmount = openInterest.amount

	let processingTimestamp = lastUpdateTimestamp

	let done = false

	if (lastUpdateTimestamp.gt(currentTimestamp)) return

	while (!done) {
		let processingDayNumber = getDayNumber(processingTimestamp)

		let lastDay = getDayNumber(currentTimestamp).equals(processingDayNumber)
		let firstDay = getDayNumber(lastUpdateTimestamp).equals(processingDayNumber)

		done = lastDay
		let dailyOpenInterest = BigInt.zero()

		if (firstDay && !lastDay) {
			let firstIntervalStart = startOfDayTimestamp(processingTimestamp)
			let firstIntervalEnd = processingTimestamp

			let secondIntervalStart = processingTimestamp
			let secondIntervalEnd = endOfDayTimestamp(processingTimestamp)

			let firstInterval = diffInSeconds(firstIntervalEnd, firstIntervalStart)
			let secondInterval = diffInSeconds(secondIntervalEnd, secondIntervalStart)
			let totalInterval = diffInSeconds(secondIntervalEnd, firstIntervalStart)

			// Calculate the day's accumulated amount
			let accumulatedFirstPart = openInterest.weightedAmount
			let accumulatedSecondPart = secondInterval.times(currentAmount)

			dailyOpenInterest = accumulatedFirstPart.plus(accumulatedSecondPart).div(totalInterval)
			openInterest.weightedAmount = BigInt.zero()
		} else if (!firstDay && !lastDay) {
			dailyOpenInterest = currentAmount
			openInterest.weightedAmount = BigInt.zero()
		} else if (!firstDay && lastDay) {
			processingTimestamp = currentTimestamp
			let firstIntervalStart = startOfDayTimestamp(processingTimestamp)
			let firstIntervalEnd = processingTimestamp

			let secondIntervalStart = processingTimestamp
			let secondIntervalEnd = endOfDayTimestamp(processingTimestamp)

			let firstInterval = diffInSeconds(firstIntervalEnd, firstIntervalStart)
			let secondInterval = diffInSeconds(secondIntervalEnd, secondIntervalStart)
			let totalInterval = diffInSeconds(secondIntervalEnd, firstIntervalStart)

			// Calculate the day's accumulated amount
			let accumulatedFirstPart = firstInterval.times(currentAmount)
			let accumulatedSecondPart = secondInterval.times(increase ? currentAmount.plus(value) : currentAmount.minus(value))

			dailyOpenInterest = accumulatedFirstPart.plus(accumulatedSecondPart).div(totalInterval)
			openInterest.weightedAmount = accumulatedFirstPart
		} else if (firstDay && lastDay) {
			processingTimestamp = lastUpdateTimestamp
			let firstIntervalStart = startOfDayTimestamp(processingTimestamp)
			let firstIntervalEnd = processingTimestamp

			let secondIntervalStart = processingTimestamp
			let secondIntervalEnd = currentTimestamp

			let thirdIntervalStart = currentTimestamp
			let thirdIntervalEnd = endOfDayTimestamp(processingTimestamp)

			let firstInterval = diffInSeconds(firstIntervalEnd, firstIntervalStart)
			let secondInterval = diffInSeconds(secondIntervalEnd, secondIntervalStart)
			let thirdInterval = diffInSeconds(thirdIntervalEnd, thirdIntervalStart)
			let totalInterval = diffInSeconds(thirdIntervalEnd, firstIntervalStart)

			// Calculate the day's accumulated amount
			let accumulatedFirstPart = openInterest.weightedAmount
			let accumulatedSecondPart = secondInterval.times(currentAmount)
			let accumulatedThirdPart = thirdInterval.times(increase ? currentAmount.plus(value) : currentAmount.minus(value))

			dailyOpenInterest = accumulatedFirstPart.plus(accumulatedSecondPart).plus(accumulatedThirdPart).div(totalInterval)
			openInterest.weightedAmount = accumulatedFirstPart.plus(accumulatedSecondPart)
		}

		if (isSolver == 1) {
			let solverDailyHistory = getSolverDailyHistoryForTimestamp(processingTimestamp, solverAccount!, accountSource, source)
			solverDailyHistory.openInterest = dailyOpenInterest
			solverDailyHistory.updateTimestamp = processingTimestamp
			solverDailyHistory.save()
		} else if (isSolver == 2) {
			let solverOnlyDailyHistory = getSolverOnlyDailyHistoryForTimestamp(processingTimestamp, solverAccount!, source)
			solverOnlyDailyHistory.openInterest = dailyOpenInterest
			solverOnlyDailyHistory.updateTimestamp = processingTimestamp
			solverOnlyDailyHistory.save()
		} else {
			let dailyHistory = getDailyHistoryForTimestamp(processingTimestamp, accountSource, source)
			dailyHistory.openInterest = dailyOpenInterest
			dailyHistory.updateTimestamp = processingTimestamp
			dailyHistory.save()
		}

		// Move to the next day
		processingTimestamp = processingTimestamp.plus(SECONDS_IN_DAY)
	}

	openInterest.timestamp = currentTimestamp
	openInterest.amount = increase ? currentAmount.plus(value) : currentAmount.minus(value)
	openInterest.save()
}

export function catchUpHistories(blockTimestamp: BigInt, source: Bytes): void {
	let yesterday = getDayNumber(blockTimestamp).minus(BigInt.fromI32(1))

	let id = "LastSettleDay"
	let settleDay = OpenInterestSettleDay.load(id)
	if (!settleDay) {
		settleDay = new OpenInterestSettleDay(id)
		settleDay.dayNumber = yesterday
		settleDay.timestamp = blockTimestamp
		settleDay.save()
		return
	}

	if (settleDay.dayNumber.ge(yesterday)) return

	let timestamp = yesterday.plus(BigInt.fromI32(1)).times(SECONDS_IN_DAY).minus(BigInt.fromI32(1))

	for (let i = 0; i < AFFILIATES.keys.length; i++) {
		let affiliateAddress = AFFILIATES.keys()[i]
		let affiliatePlayer = SymmioEntity.load(affiliateAddress)
		if (!affiliatePlayer) continue

		for (let j = 0; j < SOLVERS.keys.length; j++) {
			let solverAddress = SOLVERS.keys()[j]
			let solverPlayer = SymmioEntity.load(solverAddress)
			if (!solverPlayer) continue
			let solverAccount = Account.load(solverAddress)
			if (!solverAccount) continue

			updateDailyOpenInterest(timestamp, BigInt.zero(), true, solverAccount, BigInt.fromByteArray(affiliatePlayer.address) == BigInt.zero() ? null : affiliatePlayer.address, source)
		}
	}

	settleDay.dayNumber = yesterday
	settleDay.timestamp = blockTimestamp
	settleDay.save()
}
