import {Address, BigInt, Bytes} from "@graphprotocol/graph-ts";
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {
	Account,
	Configuration,
	DailyHistory,
	DailySymbolTradesHistory,
	DailyUserHistory,
	MonthlyHistory,
	OpenInterest,
	SymbolTradeHistory,
	TotalHistory,
	TotalSymbolTradesHistory,
	TotalUserHistory,
	UserActivity,
	WeeklyHistory
} from "../../generated/schema";
import {createNewAccount, createNewUser} from "../../common/utils/analytics&user_profile";
import {startOfDay, startOfMonth, startOfWeek} from "./time";

export function newUserAndAccount(userAddress: Address, block: ethereum.Block, transaction: ethereum.Transaction): void {
	let account = Account.load(userAddress.toHexString())
	if (account == null) {
		let user = createNewUser(userAddress, block, transaction)
		createNewAccount(userAddress, user, null, block, transaction)
	}
}

export function getDailyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null): DailyHistory {
	const dateStr = startOfDay(timestamp).getTime().toString()
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

export function getWeeklyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null): WeeklyHistory {
	const dateStr = startOfWeek(timestamp).getTime().toString()
	const id = dateStr + "_" + (accountSource === null ? "null" : accountSource.toHexString())
	let wh = WeeklyHistory.load(id)
	if (wh == null) {
		wh = new WeeklyHistory(id)
		wh.timestamp = timestamp
		wh.tradeVolume = BigInt.zero()
		wh.activeUsers = BigInt.zero()
		wh.accountSource = accountSource
		wh.save()
	}
	return wh
}

export function getMonthlyHistoryForTimestamp(timestamp: BigInt, accountSource: Bytes | null): MonthlyHistory {
	const dateStr = startOfMonth(timestamp).getTime().toString()
	const id = dateStr + "_" + (accountSource === null ? "null" : accountSource.toHexString())
	let mh = MonthlyHistory.load(id)
	if (mh == null) {
		mh = new MonthlyHistory(id)
		mh.timestamp = timestamp
		mh.tradeVolume = BigInt.zero()
		mh.activeUsers = BigInt.zero()
		mh.accountSource = accountSource
		mh.save()
	}
	return mh
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

export function getSymbolTradeHistory(symbol: BigInt, timestamp: BigInt, accountSource: Bytes | null): SymbolTradeHistory {
	const id = symbol.toString() + "_" + (accountSource === null ? "null" : accountSource.toHexString())
	let stv = SymbolTradeHistory.load(id)
	if (stv == null) {
		stv = new SymbolTradeHistory(id)
		stv.updateTimestamp = timestamp
		stv.timestamp = timestamp
		stv.accountSource = accountSource
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
): DailySymbolTradesHistory {
	const dateStr = startOfDay(timestamp)
		.getTime()
		.toString();
	const id =
		dateStr +
		"_" +
		(accountSource === null ? "null" : accountSource.toHexString()) +
		"_" +
		account.toHexString() +
		"_" +
		symbolId.toHexString();

	let history = DailySymbolTradesHistory.load(id);

	if (history == null) {
		history = new DailySymbolTradesHistory(id);
		history.updateTimestamp = timestamp;
		history.account = account;
		history.accountSource = accountSource;
		history.symbolId = symbolId;
		history.totalTrades = BigInt.zero();
		history.fundingPaid = BigInt.zero();
		history.fundingReceived = BigInt.zero();
		history.platformFeePaid = BigInt.zero();
		history.save();
	}
	return history;
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
		symbolId.toHexString();

	let history = TotalSymbolTradesHistory.load(id);

	if (history == null) {
		history = new TotalSymbolTradesHistory(id);
		history.updateTimestamp = timestamp;
		history.account = account;
		history.accountSource = accountSource;
		history.symbolId = symbolId;
		history.totalTrades = BigInt.zero();
		history.fundingPaid = BigInt.zero();
		history.fundingReceived = BigInt.zero();
		history.platformFeePaid = BigInt.zero();
		history.save();
	}
	return history;
}


export function getDailyUserHistoryForTimestamp(
	timestamp: BigInt,
	account: Account
): DailyUserHistory {
	const dateStr = startOfDay(timestamp)
		.getTime()
		.toString();
	const id =
		dateStr +
		"_" +
		(account.accountSource === null ? "null" : account.accountSource.toHexString()) +
		"_" +
		account.id;
	let dh = DailyUserHistory.load(id);
	if (dh == null) {
		// get total history
		let th = getTotalUserHistory(timestamp, account);

		dh = new DailyUserHistory(id);
		dh.updateTimestamp = timestamp;
		dh.account = account.account;
		dh.timestamp = timestamp;
		dh.deposit = BigInt.zero();
		dh.withdraw = BigInt.zero();
		dh.quotesCount = BigInt.zero();
		dh.openTradeVolume = BigInt.zero();
		dh.closeTradeVolume = BigInt.zero();
		dh.allocate = BigInt.zero();
		dh.deallocate = BigInt.zero();
		dh.accAllocate = th.allocate; // carry over from total history
		dh.accDeallocate = th.deallocate; // carry over from total history
		dh.platformFeePaid = BigInt.zero();
		dh.fundingPaid = BigInt.zero();
		dh.fundingReceived = BigInt.zero();
		dh.loss = BigInt.zero();
		dh.profit = BigInt.zero();
		dh.accountSource = account.accountSource;
		dh.save();
	}
	return dh;
}

export function getTotalUserHistory(
	timestamp: BigInt,
	account: Account
): TotalUserHistory {
	const id =
		(account.accountSource === null ? "null" : account.accountSource.toHexString()) +
		"_" +
		account;
	let th = TotalUserHistory.load(id);
	if (th == null) {
		th = new TotalUserHistory(id);
		th.updateTimestamp = timestamp;
		th.timestamp = timestamp;
		th.deposit = BigInt.zero();
		th.withdraw = BigInt.zero();
		th.quotesCount = BigInt.zero();
		th.openTradeVolume = BigInt.zero();
		th.closeTradeVolume = BigInt.zero();
		th.allocate = BigInt.zero();
		th.deallocate = BigInt.zero();
		th.platformFeePaid = BigInt.zero();
		th.fundingPaid = BigInt.zero();
		th.fundingReceived = BigInt.zero();
		th.loss = BigInt.zero();
		th.profit = BigInt.zero();
		th.account = account.account;
		th.accountSource = account.accountSource;
		th.save();
	}
	return th;
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