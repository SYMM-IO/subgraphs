import {Address, BigInt, Bytes} from "@graphprotocol/graph-ts"
import {
	Account as AccountModel,
	Account,
	Configuration,
	DailyHistory,
	OpenInterest,
	SymbolTradeVolume,
	TotalHistory,
	User as UserModel,
	UserActivity,
} from "../generated/schema"

import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum"

export function getDateFromTimeStamp(timestamp: BigInt): Date {
	let date = new Date(timestamp.toI64() * 1000)
	date.setUTCHours(0)
	date.setUTCMinutes(0)
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
}

export function getDailyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null): DailyHistory {
	const dateStr = getDateFromTimeStamp(timestamp)
		.getTime()
		.toString()
	const id = dateStr + "_" + (accountSource === null ? "null" : accountSource.toHexString())
	let dh = DailyHistory.load(id)
	if (dh == null) {
		dh = new DailyHistory(id)
		dh.updateTimestamp = timestamp
		dh.timestamp = timestamp
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.quotesCount = BigInt.zero()
		dh.tradeVolume = BigInt.zero()
		dh.openTradeVolume = BigInt.zero()
		dh.closeTradeVolume = BigInt.zero()
		dh.allocate = BigInt.zero()
		dh.deallocate = BigInt.zero()
		dh.newUsers = BigInt.zero()
		dh.activeUsers = BigInt.zero()
		dh.newAccounts = BigInt.zero()
		dh.platformFee = BigInt.zero()
		dh.openInterest = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.accountSource = accountSource
		dh.save()
	}
	return dh
}

export function getTotalHistory(timestamp: BigInt, accountSource: Bytes | null): TotalHistory {
	const id = accountSource === null ? "null" : accountSource.toHexString()
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
		th.allocate = BigInt.zero()
		th.deallocate = BigInt.zero()
		th.users = BigInt.zero()
		th.accounts = BigInt.zero()
		th.platformFee = BigInt.zero()
		th.fundingReceived = BigInt.zero()
		th.fundingPaid = BigInt.zero()
		th.accountSource = accountSource
		th.save()
	}
	return th
}

export function getSymbolTradeVolume(symbol: BigInt, timestamp: BigInt, accountSource: Bytes | null): SymbolTradeVolume {
	const id = symbol.toString() + "_" + (accountSource === null ? "null" : accountSource.toHexString())
	let stv = SymbolTradeVolume.load(id)
	if (stv == null) {
		stv = new SymbolTradeVolume(id)
		stv.updateTimestamp = timestamp
		stv.timestamp = timestamp
		stv.accountSource = accountSource
		stv.volume = BigInt.zero()
		stv.symbolId = symbol
		stv.save()
	}
	return stv
}


export function getOpenInterest(timestamp: BigInt, accountSource: Bytes | null): OpenInterest {
	const id = "OpenInterest_" + (accountSource === null ? "null" : accountSource.toHexString())
	let oi = OpenInterest.load(id)
	if (oi == null) {
		oi = new OpenInterest(id)
		oi.amount = BigInt.zero()
		oi.accumulatedAmount = BigInt.zero()
		oi.timestamp = timestamp
		oi.save()
	}
	return oi
}

export function isSameDay(timestamp1: BigInt, timestamp2: BigInt): boolean {
	return getDateFromTimeStamp(timestamp1)
		.getTime()
		.toString() == getDateFromTimeStamp(timestamp2)
		.getTime()
		.toString()

	// const date1 = new Date(timestamp1.toI64() * 1000)
	// const date2 = new Date(timestamp2.toI64() * 1000)
	//
	// return (
	// 	date1.getUTCFullYear() === date2.getUTCFullYear() &&
	// 	date1.getUTCMonth() === date2.getUTCMonth() &&
	// 	date1.getUTCDate() === date2.getUTCDate()
	// )
}

export function unDecimal(value: BigInt): BigInt {
	return value.div(BigInt.fromString("10").pow(18))
}

export function diffInSeconds(timestamp1: BigInt, timestamp2: BigInt): BigInt {
	return timestamp1.minus(timestamp2)
}

export function updateDailyOpenInterest(
	blockTimestamp: BigInt,
	value: BigInt,
	increase: boolean,
	accountSource: Bytes | null,
): void {
	let oi = getOpenInterest(blockTimestamp, accountSource)
	let dh = getDailyHistoryForTimestamp(blockTimestamp, accountSource)

	const startOfDay = BigInt.fromString(
		(getDateFromTimeStamp(blockTimestamp).getTime() / 1000).toString(),
	)

	if (isSameDay(blockTimestamp, oi.timestamp)) {
		oi.accumulatedAmount = oi.accumulatedAmount.plus(
			diffInSeconds(blockTimestamp, oi.timestamp).times(oi.amount),
		)
		dh.openInterest = oi.accumulatedAmount.div(
			diffInSeconds(blockTimestamp, startOfDay),
		)
	} else {
		dh.openInterest = oi.accumulatedAmount.div(BigInt.fromString("86400"))
		oi.accumulatedAmount = diffInSeconds(blockTimestamp, startOfDay).times(
			oi.amount,
		)
	}
	oi.amount = increase ? oi.amount.plus(value) : oi.amount.minus(value)
	oi.timestamp = blockTimestamp
	dh.updateTimestamp = blockTimestamp

	oi.save()
	dh.save()
}


export function updateActivityTimestamps(
	account: Account,
	timestamp: BigInt,
): void {
	account.lastActivityTimestamp = timestamp
	account.save()
	let ua = getUserActivity(account.user, account.accountSource, timestamp)
	let uaTimestamp = ua.updateTimestamp === null ? BigInt.zero() : ua.updateTimestamp!
	if (!isSameDay(timestamp, uaTimestamp)) {
		let dh = getDailyHistoryForTimestamp(timestamp, account.accountSource)
		dh.activeUsers = dh.activeUsers.plus(BigInt.fromString("1"))
		dh.save()
	}
	ua.updateTimestamp = timestamp
	ua.save()
}

export function getUserActivity(user: Bytes, accountSource: Bytes | null, timestamp: BigInt): UserActivity {
	const id = user.toHexString() + "_" + (accountSource === null ? "null" : accountSource.toHexString())
	let ua = UserActivity.load(id)
	if (ua == null) {
		ua = new UserActivity(id)
		ua.user = user
		ua.accountSource = accountSource
		ua.timestamp = timestamp
		ua.save()
	}
	return ua
}

export function createNewUser(address: Bytes, accountSource: Bytes | null, block: ethereum.Block, transaction: ethereum.Transaction): UserModel {
	let user = new UserModel(address.toHexString())
	user.timestamp = block.timestamp
	user.transaction = transaction.hash
	user.address = address
	user.save()
	const dh = getDailyHistoryForTimestamp(block.timestamp, accountSource)
	dh.newUsers = dh.newUsers.plus(BigInt.fromString("1"))
	dh.save()
	const th = getTotalHistory(block.timestamp, accountSource)
	th.users = th.users.plus(BigInt.fromString("1"))
	th.save()
	return user
}


export function createNewAccount(address: Bytes, user: UserModel, accountSource: Bytes | null, block: ethereum.Block, transaction: ethereum.Transaction, name: string | null = null): AccountModel {
	let account = new AccountModel(address.toHexString())
	account.lastActivityTimestamp = block.timestamp
	account.timestamp = block.timestamp
	account.blockNumber = block.number
	account.transaction = transaction.hash
	account.deposit = BigInt.zero()
	account.withdraw = BigInt.zero()
	account.allocated = BigInt.zero()
	account.deallocated = BigInt.zero()
	account.quotesCount = BigInt.zero()
	account.positionsCount = BigInt.zero()
	account.user = user.address
	account.updateTimestamp = block.timestamp
	account.accountSource = accountSource
	account.name = name
	account.save()
	const dh = getDailyHistoryForTimestamp(block.timestamp, accountSource)
	dh.newAccounts = dh.newAccounts.plus(BigInt.fromString("1"))
	dh.save()
	const th = getTotalHistory(block.timestamp, accountSource)
	th.accounts = th.accounts.plus(BigInt.fromString("1"))
	th.save()
	return account
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