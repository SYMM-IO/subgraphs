import {Address, BigInt, Bytes} from "@graphprotocol/graph-ts"
import {
	Account,
	Configuration,
	DailyHistory,
	MonthlyHistory,
	OpenInterest,
	PriceCheck,
	Quote,
	Symbol,
	SymbolTradeVolume,
	TotalHistory,
	TradeHistory,
	UserActivity,
	WeeklyHistory,
} from "../generated/schema"

import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum"
import {FillCloseRequest, LiquidatePositionsPartyA} from "../generated/symmio/symmio"
import {getQuote} from "./contract_utils"
import {createNewAccount, createNewUser} from "../common/utils/analytics&user_profile"

// @ts-ignore
export let rolesNames = new Map<string, string>()
rolesNames.set("0x1effbbff9c66c5e59634f24fe842750c60d18891155c32dd155fc2d661a4c86d", "DEFAULT_ADMIN_ROLE")
rolesNames.set("0xb048589f9ee6ae43a7d6093c04bc48fc93d622d76009b51a2c566fc7cda84ce7", "MUON_SETTER_ROLE")
rolesNames.set("0xddf732565ddd4d1d3a527786b8b1e425a602b603d457c0a999938869f38049b0", "SYMBOL_MANAGER_ROLE")
rolesNames.set("0x61c92169ef077349011ff0b1383c894d86c5f0b41d986366b58a6cf31e93beda", "SETTER_ROLE")
rolesNames.set("0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a", "PAUSER_ROLE")
rolesNames.set("0x427da25fe773164f88948d3e215c94b6554e2ed5e5f203a821c9f2f6131cf75a", "UNPAUSER_ROLE")
rolesNames.set("0x23288e74cb14deb13fd69e749986e8975f19aa3efb14b2fe5e9b512d772f19b3", "PARTY_B_MANAGER_ROLE")
rolesNames.set("0x5e17fc5225d4a099df75359ce1f405503ca79498a8dc46a7d583235a0ee45c16", "LIQUIDATOR_ROLE")
rolesNames.set("0x905e7c6bceabadb31a2ebbb666d0d6df4dfb3156f376c424680851d38988ea84", "SUSPENDER_ROLE")
rolesNames.set("0xc785f0e55c16138ca0f8448186fa6229be092a3a83db3c5d63c9286723c5a2c4", "DISPUTE_ROLE")

// @ts-ignore
export let rolesNamesMultiAccount = new Map<string, string>()
rolesNamesMultiAccount.set("0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a", "PAUSER_ROLE")
rolesNamesMultiAccount.set("0x61c92169ef077349011ff0b1383c894d86c5f0b41d986366b58a6cf31e93beda", "SETTER_ROLE")
rolesNamesMultiAccount.set("0x427da25fe773164f88948d3e215c94b6554e2ed5e5f203a821c9f2f6131cf75a", "UNPAUSER_ROLE")
rolesNamesMultiAccount.set("0x0000000000000000000000000000000000000000000000000000000000000000", "DEFAULT_ADMIN_ROLE")

export enum QuoteStatus {
	PENDING,
	LOCKED,
	CANCEL_PENDING,
	CANCELED,
	OPENED,
	CLOSE_PENDING,
	CANCEL_CLOSE_PENDING,
	CLOSED,
	LIQUIDATED,
	EXPIRED,
}

export function newUserAndAccount(userAddress: Address, block: ethereum.Block, transaction: ethereum.Transaction): void {
	let account = Account.load(userAddress.toHexString())
	if (account == null) {
		let user = createNewUser(userAddress, block, transaction)
		account = createNewAccount(userAddress, user, null, block, transaction)
	}
}

export function startOfDay(timestamp: BigInt): Date {
	let date = new Date(timestamp.toI64() * 1000)
	date.setUTCHours(0)
	date.setUTCMinutes(0)
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
}

export function startOfWeek(timestamp: BigInt): Date {
	let date = new Date(timestamp.toI64() * 1000)
	let day = date.getUTCDay()
	let diff = date.getUTCDate() - day
	date.setUTCDate(diff)
	date.setUTCHours(0)
	date.setUTCMinutes(0)
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
}

export function startOfMonth(timestamp: BigInt): Date {
	let date = new Date(timestamp.toI64() * 1000)
	date.setUTCDate(1)
	date.setUTCHours(0)
	date.setUTCMinutes(0)
	date.setUTCSeconds(0)
	date.setUTCMilliseconds(0)
	return date
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
	return startOfDay(timestamp1).getTime().toString() == startOfDay(timestamp2).getTime().toString()
}

export function isSameWeek(timestamp1: BigInt, timestamp2: BigInt): boolean {
	return startOfWeek(timestamp1).getTime().toString() == startOfWeek(timestamp2).getTime().toString()
}

export function isSameMonth(timestamp1: BigInt, timestamp2: BigInt): boolean {
	return startOfMonth(timestamp1).getTime().toString() == startOfMonth(timestamp2).getTime().toString()
}

export function unDecimal(value: BigInt): BigInt {
	return value.div(BigInt.fromString("10").pow(18))
}

export function diffInSeconds(timestamp1: BigInt, timestamp2: BigInt): BigInt {
	return timestamp1.minus(timestamp2)
}

export function updateDailyOpenInterest(blockTimestamp: BigInt, value: BigInt, increase: boolean, accountSource: Bytes | null): void {
	let oi = getOpenInterest(blockTimestamp, accountSource)
	let dh = getDailyHistoryForTimestamp(blockTimestamp, accountSource)

	const sod = BigInt.fromString((startOfDay(blockTimestamp).getTime() / 1000).toString())

	if (isSameDay(blockTimestamp, oi.timestamp)) {
		oi.accumulatedAmount = oi.accumulatedAmount.plus(diffInSeconds(blockTimestamp, oi.timestamp).times(oi.amount))
		dh.openInterest = oi.accumulatedAmount.div(diffInSeconds(blockTimestamp, sod))
	} else {
		dh.openInterest = oi.accumulatedAmount.div(BigInt.fromString("86400"))
		oi.accumulatedAmount = diffInSeconds(blockTimestamp, sod).times(oi.amount)
	}
	oi.amount = increase ? oi.amount.plus(value) : oi.amount.minus(value)
	oi.timestamp = blockTimestamp
	dh.updateTimestamp = blockTimestamp

	oi.save()
	dh.save()
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

export function handleClose(_event: ethereum.Event, name: string): void {
	// @ts-ignore
	const event = changetype<FillCloseRequest>(_event) // FillClose, ForceClose, EmergencyClose all have the same event signature
	let quote = Quote.load(event.params.quoteId.toString())!
	let history = TradeHistory.load(event.params.partyA.toHexString() + "-" + event.params.quoteId.toString())!
	const additionalVolume = event.params.filledAmount.times(event.params.closedPrice).div(BigInt.fromString("10").pow(18))
	history.volume = history.volume.plus(additionalVolume)
	history.updateTimestamp = event.block.timestamp
	history.quoteStatus = quote.quoteStatus
	history.quote = event.params.quoteId
	history.save()

	let priceCheck = new PriceCheck(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())
	priceCheck.event = name
	priceCheck.symbol = Symbol.load(quote.symbolId!.toString())!.name
	priceCheck.givenPrice = event.params.closedPrice
	priceCheck.timestamp = event.block.timestamp
	priceCheck.transaction = event.transaction.hash
	priceCheck.additionalInfo = quote.id
	priceCheck.save()

	let account = Account.load(event.params.partyA.toHexString())!

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
	dh.tradeVolume = dh.tradeVolume.plus(additionalVolume)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(additionalVolume)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(event.block.timestamp, account.accountSource)
	th.tradeVolume = th.tradeVolume.plus(additionalVolume)
	th.closeTradeVolume = th.closeTradeVolume.plus(additionalVolume)
	th.updateTimestamp = event.block.timestamp
	th.save()

	let stv = getSymbolTradeVolume(quote.symbolId!, event.block.timestamp, account.accountSource)
	stv.volume = stv.volume.plus(additionalVolume)
	stv.updateTimestamp = event.block.timestamp
	stv.save()

	updateDailyOpenInterest(event.block.timestamp, unDecimal(event.params.filledAmount.times(quote.openedPrice!)), false, account.accountSource)
}

export function handleLiquidatePosition(_event: ethereum.Event, qId: BigInt): void {
	// @ts-ignore
	const event = changetype<LiquidatePositionsPartyA>(_event)
	let history = TradeHistory.load(event.params.partyA.toHexString() + "-" + qId.toString())!
	const quote = Quote.load(qId.toString())!
	const chainQuote = getQuote(event.address, qId)
	if (chainQuote == null) return
	const liquidAmount = quote.quantity!.minus(quote.closedAmount!)
	const liquidPrice = chainQuote.avgClosedPrice.times(quote.quantity!).minus(quote.averageClosedPrice!.times(quote.closedAmount!)).div(liquidAmount)
	const additionalVolume = liquidAmount.times(liquidPrice).div(BigInt.fromString("10").pow(18))
	history.volume = history.volume.plus(additionalVolume)
	history.quoteStatus = QuoteStatus.LIQUIDATED
	history.updateTimestamp = event.block.timestamp
	history.quote = qId
	history.save()

	let account = Account.load(quote.partyA.toHexString())!

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
	dh.tradeVolume = dh.tradeVolume.plus(additionalVolume)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(additionalVolume)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(event.block.timestamp, account.accountSource)
	th.tradeVolume = th.tradeVolume.plus(additionalVolume)
	th.closeTradeVolume = th.closeTradeVolume.plus(additionalVolume)
	th.updateTimestamp = event.block.timestamp
	th.save()

	let stv = getSymbolTradeVolume(quote.symbolId!, event.block.timestamp, account.accountSource)
	stv.volume = stv.volume.plus(additionalVolume)
	stv.updateTimestamp = event.block.timestamp
	stv.save()

	updateDailyOpenInterest(event.block.timestamp, unDecimal(liquidAmount.times(quote.openedPrice!)), false, account.accountSource)
}
