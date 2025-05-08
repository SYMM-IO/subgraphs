import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Configuration, DailyHistory, MonthlyHistory, Players, TotalHistory, UserActivity, WeeklyHistory } from "../../../generated/schema"
import { getDayNumber, startOfDay, startOfMonth, startOfWeek } from "../../../perps/analytics/utils/time"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ZERO_ADDRESS_BYTES = Bytes.fromHexString("0x0000000000000000000000000000000000000000")

export function getDailyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null): DailyHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
	const id = dateStr + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let dh = DailyHistory.load(id)
	if (dh == null) {
		dh = new DailyHistory(id)
		dh.day = getDayNumber(timestamp)
		dh.updateTimestamp = timestamp
		dh.timestamp = timestamp
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.intentsCount = BigInt.zero()
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
		dh.openInterest = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.positionsCount = BigInt.zero()
		dh.averagePositionSize = BigInt.zero()
		dh.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		dh.save()
	}
	return dh
}

export function getMonthlyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null): MonthlyHistory {
	const dateStr = startOfMonth(timestamp).getTime().toString()
	const id = dateStr + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let mh = MonthlyHistory.load(id)
	if (mh == null) {
		mh = new MonthlyHistory(id)
		mh.timestamp = timestamp
		mh.tradeVolume = BigInt.zero()
		mh.activeUsers = BigInt.zero()
		mh.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		mh.save()
	}
	return mh
}

export function getWeeklyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null): WeeklyHistory {
	const dateStr = startOfWeek(timestamp).getTime().toString()
	const id = dateStr + "_" + (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString())
	let wh = WeeklyHistory.load(id)
	if (wh == null) {
		wh = new WeeklyHistory(id)
		wh.timestamp = timestamp
		wh.tradeVolume = BigInt.zero()
		wh.activeUsers = BigInt.zero()
		wh.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		wh.save()
	}
	return wh
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

export function getTotalHistory(timestamp: BigInt, accountSource: Bytes | null, collateral: Bytes): TotalHistory {
	const id = (accountSource === null ? ZERO_ADDRESS : accountSource.toHexString()) + "_" + collateral.toHexString()
	let th = TotalHistory.load(id)
	if (th == null) {
		th = new TotalHistory(id)
		th.updateTimestamp = timestamp
		th.timestamp = timestamp
		th.deposit = BigInt.zero()
		th.withdraw = BigInt.zero()
		th.intentsCount = BigInt.zero()
		th.tradeVolume = BigInt.zero()
		th.openTradeVolume = BigInt.zero()
		th.closeTradeVolume = BigInt.zero()
		th.liquidateTradeVolume = BigInt.zero()
		th.allocate = BigInt.zero()
		th.deallocate = BigInt.zero()
		th.users = BigInt.zero()
		th.accounts = BigInt.zero()
		th.platformFee = BigInt.zero()
		th.fundingReceived = BigInt.zero()
		th.fundingPaid = BigInt.zero()
		th.collateral = collateral
		th.accountSource = accountSource === null ? ZERO_ADDRESS_BYTES : accountSource
		th.save()
	}
	return th
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
