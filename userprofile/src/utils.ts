import {BigInt, Bytes} from "@graphprotocol/graph-ts"
import {
	Account as AccountModel,
	Configuration,
	DailyHistory,
	DailySymbolTradesHistory,
	TotalHistory,
	TotalSymbolTradesHistory,
	User as UserModel,
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

export function getDailySymbolTradesHistory(
	timestamp: BigInt,
	account: Bytes,
	accountSource: Bytes | null,
	symbolId: BigInt,
): DailySymbolTradesHistory {
	const dateStr = getDateFromTimeStamp(timestamp)
		.getTime()
		.toString()
	const id =
		dateStr +
		"_" +
		(accountSource === null ? "null" : accountSource.toHexString()) +
		"_" +
		account.toHexString() +
		"_" +
		symbolId.toHexString()

	let history = DailySymbolTradesHistory.load(id)

	if (history == null) {
		history = new DailySymbolTradesHistory(id)
		history.updateTimestamp = timestamp
		history.account = account
		history.accountSource = accountSource
		history.symbolId = symbolId
		history.totalTrades = BigInt.zero()
		history.fundingPaid = BigInt.zero()
		history.fundingReceived = BigInt.zero()
		history.platformFeePaid = BigInt.zero()
		history.save()
	}
	return history
}

export function getTotalSymbolTradesHistory(
	timestamp: BigInt,
	account: Bytes,
	accountSource: Bytes | null,
	symbolId: BigInt,
): TotalSymbolTradesHistory {
	const id =
		(accountSource === null ? "null" : accountSource.toHexString()) +
		"_" +
		account.toHexString() +
		"_" +
		symbolId.toHexString()

	let history = TotalSymbolTradesHistory.load(id)

	if (history == null) {
		history = new TotalSymbolTradesHistory(id)
		history.updateTimestamp = timestamp
		history.account = account
		history.accountSource = accountSource
		history.symbolId = symbolId
		history.totalTrades = BigInt.zero()
		history.fundingPaid = BigInt.zero()
		history.fundingReceived = BigInt.zero()
		history.platformFeePaid = BigInt.zero()
		history.save()
	}
	return history
}


export function getDailyHistoryForTimestamp(
	timestamp: BigInt,
	account: Bytes,
	accountSource: Bytes | null,
): DailyHistory {
	const dateStr = getDateFromTimeStamp(timestamp)
		.getTime()
		.toString()
	const id =
		dateStr +
		"_" +
		(accountSource === null ? "null" : accountSource.toHexString()) +
		"_" +
		account.toHexString()
	let dh = DailyHistory.load(id)
	if (dh == null) {
		// get total history
		let th = getTotalHistory(timestamp, account, accountSource)

		dh = new DailyHistory(id)
		dh.updateTimestamp = timestamp
		dh.account = account
		dh.timestamp = timestamp
		dh.deposit = BigInt.zero()
		dh.withdraw = BigInt.zero()
		dh.quotesCount = BigInt.zero()
		dh.openTradeVolume = BigInt.zero()
		dh.closeTradeVolume = BigInt.zero()
		dh.allocate = BigInt.zero()
		dh.deallocate = BigInt.zero()
		dh.accAllocate = th.allocate // carry over from total history
		dh.accDeallocate = th.deallocate // carry over from total history
		dh.platformFeePaid = BigInt.zero()
		dh.fundingPaid = BigInt.zero()
		dh.fundingReceived = BigInt.zero()
		dh.loss = BigInt.zero()
		dh.profit = BigInt.zero()
		dh.accountSource = accountSource
		dh.save()
	}
	return dh
}

export function getTotalHistory(
	timestamp: BigInt,
	account: Bytes,
	accountSource: Bytes | null,
): TotalHistory {
	const id =
		(accountSource === null ? "null" : accountSource.toHexString()) +
		"_" +
		account.toHexString()
	let th = TotalHistory.load(id)
	if (th == null) {
		th = new TotalHistory(id)
		th.updateTimestamp = timestamp
		th.timestamp = timestamp
		th.deposit = BigInt.zero()
		th.withdraw = BigInt.zero()
		th.quotesCount = BigInt.zero()
		th.openTradeVolume = BigInt.zero()
		th.closeTradeVolume = BigInt.zero()
		th.allocate = BigInt.zero()
		th.deallocate = BigInt.zero()
		th.platformFeePaid = BigInt.zero()
		th.fundingPaid = BigInt.zero()
		th.fundingReceived = BigInt.zero()
		th.loss = BigInt.zero()
		th.profit = BigInt.zero()
		th.account = account
		th.accountSource = accountSource
		th.save()
	}
	return th
}

export function unDecimal(value: BigInt, power: number = 18): BigInt {
	return value.div(BigInt.fromString("10").pow(18))
}

export function createNewUser(
	address: string,
	accountSource: Bytes | null,
	block: ethereum.Block,
	transaction: ethereum.Transaction,
): UserModel {
	let user = new UserModel(address)
	user.timestamp = block.timestamp
	user.transaction = transaction.hash
	user.save()
	return user
}

export function createNewAccount(
	address: string,
	user: UserModel,
	accountSource: Bytes | null,
	block: ethereum.Block,
	transaction: ethereum.Transaction,
	name: string | null = null,
): AccountModel {
	let account = new AccountModel(address)
	account.lastActivityTimestamp = block.timestamp
	account.timestamp = block.timestamp
	account.transaction = transaction.hash
	account.deposit = BigInt.zero()
	account.withdraw = BigInt.zero()
	account.allocated = BigInt.zero()
	account.deallocated = BigInt.zero()
	account.quotesCount = BigInt.zero()
	account.positionsCount = BigInt.zero()
	account.user = user.id
	account.updateTimestamp = block.timestamp
	account.accountSource = accountSource
	account.name = name
	account.save()
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
