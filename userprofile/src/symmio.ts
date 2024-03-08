import {BigInt, Bytes, ethereum} from "@graphprotocol/graph-ts"
import {
	AcceptCancelCloseRequest,
	AcceptCancelRequest,
	ActiveEmergencyMode,
	AddSymbol,
	AllocateForPartyB,
	AllocatePartyA,
	AllocatePartyB,
	ChargeFundingRate,
	DeactiveEmergencyMode,
	DeallocateForPartyB,
	DeallocatePartyA,
	Deposit,
	DiamondCut,
	EmergencyClosePosition,
	ExpireQuote,
	FillCloseRequest,
	ForceCancelCloseRequest,
	ForceCancelQuote,
	ForceClosePosition,
	FullyLiquidatedPartyB,
	LiquidatePartyA,
	LiquidatePartyB,
	LiquidatePositionsPartyA,
	LiquidatePositionsPartyB,
	LiquidationDisputed,
	LockQuote,
	OpenPosition,
	PauseAccounting,
	PauseGlobal,
	PauseLiquidation,
	PausePartyAActions,
	PausePartyBActions,
	RegisterPartyB,
	RequestToCancelCloseRequest,
	RequestToCancelQuote,
	RequestToClosePosition,
	SendQuote,
	SetCollateral,
	SetDeallocateCooldown,
	SetFeeCollector,
	SetForceCancelCloseCooldown,
	SetForceCancelCooldown,
	SetForceCloseCooldown,
	SetForceCloseGapRatio,
	SetLiquidationTimeout,
	SetLiquidatorShare,
	SetMuonConfig,
	SetMuonIds,
	SetPartyBEmergencyStatus,
	SetPendingQuotesValidLength,
	SetSuspendedAddress,
	SetSymbolAcceptableValues,
	SetSymbolMaxSlippage,
	SetSymbolsPrices,
	SetSymbolTradingFee,
	SetSymbolValidationState,
	TransferAllocation,
	UnlockQuote,
	UnpauseAccounting,
	UnpauseGlobal,
	UnpauseLiquidation,
	UnpausePartyAActions,
	UnpausePartyBActions,
	Withdraw,
} from "../generated/symmio/symmio"
import {Account as AccountModel, BalanceChange, Quote as QuoteModel, Symbol} from "./../generated/schema"
import {getQuote} from "./contract_utils"
import {
	createNewAccount,
	createNewUser,
	getConfiguration,
	getDailyHistoryForTimestamp,
	getDailySymbolTradesHistory,
	getTotalHistory,
	getTotalSymbolTradesHistory,
	unDecimal,
} from "./utils"

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

// //////////////////////////////////// CONTROL ////////////////////////////////////////
export function handleAddSymbol(event: AddSymbol): void {
	let symbol = new Symbol(event.params.id.toString())
	symbol.name = event.params.name
	symbol.tradingFee = event.params.tradingFee
	symbol.timestamp = event.block.timestamp
	symbol.updateTimestamp = event.block.timestamp
	symbol.save()
}

export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	let symbol = Symbol.load(event.params.symbolId.toString())!
	symbol.tradingFee = event.params.tradingFee
	symbol.updateTimestamp = event.block.timestamp
	symbol.save()
}

// //////////////////////////////////// Accounting ////////////////////////////////////////
export function handleAllocatePartyA(event: AllocatePartyA): void {
	let account = AccountModel.load(event.params.user.toHexString())!
	account.allocated = account.allocated.plus(event.params.amount)
	account.updateTimestamp = event.block.timestamp
	account.save()

	let allocate = new BalanceChange(
		event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
	)
	allocate.type = "ALLOCATE_PARTY_A"
	allocate.timestamp = event.block.timestamp
	allocate.blockNumber = event.block.number
	allocate.transaction = event.transaction.hash
	allocate.amount = event.params.amount
	allocate.account = account.id
	allocate.collateral = getConfiguration(event).collateral
	allocate.save()

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	dh.allocate = dh.allocate.plus(event.params.amount)
	dh.accAllocate = dh.accAllocate.plus(event.params.amount)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	th.allocate = th.allocate.plus(event.params.amount)
	th.updateTimestamp = event.block.timestamp
	th.save()
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let account = AccountModel.load(event.params.user.toHexString())
	if (account == null) return
	account.deallocated = account.deallocated.plus(event.params.amount)
	account.updateTimestamp = event.block.timestamp
	account.save()

	let deallocate = new BalanceChange(
		event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
	)
	deallocate.type = "DEALLOCATE_PARTY_A"
	deallocate.timestamp = event.block.timestamp
	deallocate.blockNumber = event.block.number
	deallocate.transaction = event.transaction.hash
	deallocate.amount = event.params.amount
	deallocate.account = account.id
	deallocate.collateral = getConfiguration(event).collateral
	deallocate.save()

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	dh.deallocate = dh.deallocate.plus(event.params.amount)
	dh.accDeallocate = dh.accDeallocate.plus(event.params.amount)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	th.deallocate = th.deallocate.plus(event.params.amount)
	th.updateTimestamp = event.block.timestamp
	th.save()
}

export function handleDeposit(event: Deposit): void {
	let account = AccountModel.load(event.params.user.toHexString())
	if (account == null) {
		let user = createNewUser(
			event.params.user.toHexString(),
			null,
			event.block,
			event.transaction,
		)
		account = createNewAccount(
			event.params.user.toHexString(),
			user,
			null,
			event.block,
			event.transaction,
		)
	}

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	dh.deposit = dh.deposit.plus(event.params.amount)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	th.deposit = th.deposit.plus(event.params.amount)
	th.updateTimestamp = event.block.timestamp
	th.save()
}

export function handleWithdraw(event: Withdraw): void {
	let account = AccountModel.load(event.params.sender.toHexString())
	if (account == null) {
		let user = createNewUser(
			event.params.sender.toHexString(),
			null,
			event.block,
			event.transaction,
		)
		account = createNewAccount(
			event.params.sender.toHexString(),
			user,
			null,
			event.block,
			event.transaction,
		)
	}

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	dh.withdraw = dh.withdraw.plus(event.params.amount)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.user,
		account.accountSource,
	)
	th.withdraw = th.withdraw.plus(event.params.amount)
	th.updateTimestamp = event.block.timestamp
	th.save()
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let account = AccountModel.load(event.params.partyB.toHexString())!
	account.allocated = account.allocated.plus(event.params.amount)
	account.updateTimestamp = event.block.timestamp
	account.save()
}

export function handleAllocatePartyB(event: AllocatePartyB): void {
	let account = AccountModel.load(event.params.partyB.toHexString())!
	account.allocated = account.allocated.plus(event.params.amount)
	account.updateTimestamp = event.block.timestamp
	account.save()
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let account = AccountModel.load(event.params.partyB.toHexString())!
	account.deallocated = account.deallocated.plus(event.params.amount)
	account.updateTimestamp = event.block.timestamp
	account.save()
}

// //////////////////////////////////// Main ////////////////////////////////////////
export function handleSendQuote(event: SendQuote): void {
	let account = AccountModel.load(event.params.partyA.toHexString())!
	account.quotesCount = account.quotesCount.plus(BigInt.fromString("1"))
	account.save()
	let quote = new QuoteModel(event.params.quoteId.toString())
	quote.timestamp = event.block.timestamp
	quote.updateTimestamp = event.block.timestamp
	quote.blockNumber = event.block.number
	quote.transaction = event.transaction.hash
	if (event.params.partyBsWhiteList) {
		let partyBsWhiteList: Bytes[] = []
		for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++)
			partyBsWhiteList.push(event.params.partyBsWhiteList[i])
		quote.partyBsWhiteList = partyBsWhiteList
	}
	quote.symbolId = event.params.symbolId
	quote.positionType = event.params.positionType
	quote.orderType = event.params.orderType
	quote.price = event.params.price
	quote.marketPrice = event.params.marketPrice
	quote.deadline = event.params.deadline
	quote.quantity = event.params.quantity
	quote.cva = event.params.cva
	quote.partyAmm = event.params.partyAmm
	quote.partyBmm = event.params.partyBmm
	quote.lf = event.params.lf
	quote.quoteStatus = QuoteStatus.PENDING
	quote.account = account.id
	quote.closedAmount = BigInt.zero()
	quote.avgClosedPrice = BigInt.zero()
	quote.pnl = BigInt.zero()
	quote.fundingPaid = BigInt.zero()
	quote.fundingReceived = BigInt.zero()
	quote.collateral = getConfiguration(event).collateral
	quote.save()

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	dh.quotesCount = dh.quotesCount.plus(BigInt.fromString("1"))
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	th.quotesCount = th.quotesCount.plus(BigInt.fromString("1"))
	th.updateTimestamp = event.block.timestamp
	th.save()
}

export function handleExpireQuote(event: ExpireQuote): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!
	quote.quoteStatus = event.params.quoteStatus
	quote.updateTimestamp = event.block.timestamp
	quote.save()
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())
	if (quote == null) return
	quote.quoteStatus = QuoteStatus.CANCELED
	quote.updateTimestamp = event.block.timestamp
	quote.save()
}

export function handleLockQuote(event: LockQuote): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!
	quote.updateTimestamp = event.block.timestamp
	quote.partyB = event.params.partyB
	quote.quoteStatus = QuoteStatus.LOCKED
	quote.save()
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!
	quote.updateTimestamp = event.block.timestamp
	quote.partyB = null
	quote.quoteStatus = QuoteStatus.PENDING
	quote.save()
}

export function handleOpenPosition(event: OpenPosition): void {
	let account = AccountModel.load(event.params.partyA.toHexString())!
	account.positionsCount = account.positionsCount.plus(BigInt.fromString("1"))
	account.updateTimestamp = event.block.timestamp
	account.save()

	let quote = QuoteModel.load(event.params.quoteId.toString())!
	const chainQuote = getQuote(event.address, BigInt.fromString(quote.id))!
	quote.openPrice = event.params.openedPrice
	quote.cva = chainQuote.lockedValues.cva
	quote.lf = chainQuote.lockedValues.lf
	quote.partyAmm = chainQuote.lockedValues.partyAmm
	quote.partyBmm = chainQuote.lockedValues.partyBmm
	quote.quantity = event.params.filledAmount
	quote.updateTimestamp = event.block.timestamp
	quote.quoteStatus = QuoteStatus.OPENED
	quote.save()

	const symbol = Symbol.load(quote.symbolId.toString())

	if (symbol == null) return

	const tradingFee = event.params.filledAmount
		.times(quote.openPrice!)
		.times(symbol.tradingFee)
		.div(BigInt.fromString("10").pow(36))

	const volume = unDecimal(
		event.params.filledAmount.times(event.params.openedPrice),
	)

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	dh.openTradeVolume = dh.openTradeVolume.plus(volume)
	dh.platformFeePaid = dh.platformFeePaid.plus(tradingFee)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	th.openTradeVolume = th.openTradeVolume.plus(volume)
	th.platformFeePaid = th.platformFeePaid.plus(tradingFee)
	th.updateTimestamp = event.block.timestamp
	th.save()

	const dailySymbolTradesHistory = getDailySymbolTradesHistory(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
		quote.symbolId,
	)
	dailySymbolTradesHistory.totalTrades = dailySymbolTradesHistory.totalTrades.plus(BigInt.fromString("1"))
	dailySymbolTradesHistory.platformFeePaid = dailySymbolTradesHistory.platformFeePaid.plus(tradingFee)
	dailySymbolTradesHistory.updateTimestamp = event.block.timestamp
	dailySymbolTradesHistory.save()

	const totalSymbolTradesHistory = getTotalSymbolTradesHistory(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
		quote.symbolId,
	)
	totalSymbolTradesHistory.totalTrades = totalSymbolTradesHistory.totalTrades.plus(BigInt.fromString("1"))
	totalSymbolTradesHistory.platformFeePaid = totalSymbolTradesHistory.platformFeePaid.plus(tradingFee)
	totalSymbolTradesHistory.updateTimestamp = event.block.timestamp
	totalSymbolTradesHistory.save()
}

export function handleRequestToClosePosition(
	event: RequestToClosePosition,
): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!
	quote.quoteStatus = QuoteStatus.CLOSE_PENDING
	quote.updateTimestamp = event.block.timestamp
	quote.save()
}

export function handleRequestToCancelCloseRequest(
	event: RequestToCancelCloseRequest,
): void {
}

export function handleAcceptCancelCloseRequest(
	event: AcceptCancelCloseRequest,
): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!
	quote.quoteStatus = QuoteStatus.OPENED
	quote.save()
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	handleClose(event, "FillCloseRequest")
}

export function handleEmergencyClosePosition(
	event: EmergencyClosePosition,
): void {
	handleClose(event, "EmergencyClosePosition")
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	handleClose(event, "ForceClosePosition")
}

export function handleLiquidatePositionsPartyA(
	event: LiquidatePositionsPartyA,
): void {
	for (let i = 0; i < event.params.quoteIds.length; i++) {
		const qId = event.params.quoteIds[i]
		handleLiquidatePosition(event, qId)
	}
}

export function handleLiquidatePositionsPartyB(
	event: LiquidatePositionsPartyB,
): void {
	for (let i = 0; i < event.params.quoteIds.length; i++) {
		const qId = event.params.quoteIds[i]
		handleLiquidatePosition(event, qId)
	}
}

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
}

export function handleLiquidationDisputed(event: LiquidationDisputed): void {
}

function handleLiquidatePosition(_event: ethereum.Event, qId: BigInt): void {
	const event = changetype<LiquidatePositionsPartyA>(_event)
	const quote = QuoteModel.load(qId.toString())!
	quote.quoteStatus = QuoteStatus.LIQUIDATED
	quote.updateTimestamp = event.block.timestamp
	quote.liquidatedSide = 1
	quote.save()
	const chainQuote = getQuote(event.address, qId)
	if (chainQuote == null) return
	const liquidAmount = quote.quantity.minus(quote.closedAmount)
	const liquidPrice = chainQuote.avgClosedPrice
		.times(quote.quantity)
		.minus(quote.avgClosedPrice.times(quote.closedAmount))
		.div(liquidAmount)
	const additionalVolume = liquidAmount
		.times(liquidPrice)
		.div(BigInt.fromString("10").pow(18))

	quote.avgClosedPrice = chainQuote.avgClosedPrice
	const pnl = unDecimal(
		(quote.positionType == 0
				? BigInt.fromString("1")
				: BigInt.fromString("1").neg()
		)
			.times(liquidPrice.minus(quote.openPrice!))
			.times(liquidAmount),
	)
	quote.pnl = quote.pnl.plus(pnl)
	quote.save()

	let account = AccountModel.load(quote.account)!

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(additionalVolume)
	if (pnl.gt(BigInt.zero())) dh.profit = dh.profit.plus(pnl)
	else dh.loss = dh.loss.plus(pnl)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	th.closeTradeVolume = th.closeTradeVolume.plus(additionalVolume)
	if (pnl.gt(BigInt.zero())) th.profit = th.profit.plus(pnl)
	else th.loss = th.loss.plus(pnl)
	th.updateTimestamp = event.block.timestamp
	th.save()
}

function handleClose(_event: ethereum.Event, name: string): void {
	const event = changetype<FillCloseRequest>(_event) // FillClose, ForceClose, EmergencyClose all have the same event signature
	let quote = QuoteModel.load(event.params.quoteId.toString())!
	quote.avgClosedPrice = quote.avgClosedPrice
		.times(quote.closedAmount)
		.plus(event.params.filledAmount.times(event.params.closedPrice))
		.div(quote.closedAmount.plus(event.params.filledAmount))
	quote.closedAmount = quote.closedAmount.plus(event.params.filledAmount)
	if (quote.closedAmount.equals(quote.quantity))
		quote.quoteStatus = QuoteStatus.CLOSED
	quote.updateTimestamp = event.block.timestamp
	const pnl = unDecimal(
		(quote.positionType == 0
				? BigInt.fromString("1")
				: BigInt.fromString("1").neg()
		)
			.times(event.params.closedPrice.minus(quote.openPrice!))
			.times(event.params.filledAmount),
	)
	quote.pnl = quote.pnl.plus(pnl)
	quote.save()

	const additionalVolume = event.params.filledAmount
		.times(event.params.closedPrice)
		.div(BigInt.fromString("10").pow(18))

	let account = AccountModel.load(event.params.partyA.toHexString())!

	const dh = getDailyHistoryForTimestamp(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	dh.closeTradeVolume = dh.closeTradeVolume.plus(additionalVolume)
	if (pnl.gt(BigInt.zero())) dh.profit = dh.profit.plus(pnl)
	else dh.loss = dh.loss.plus(pnl)
	dh.updateTimestamp = event.block.timestamp
	dh.save()

	const th = getTotalHistory(
		event.block.timestamp,
		event.params.partyA,
		account.accountSource,
	)
	th.closeTradeVolume = th.closeTradeVolume.plus(additionalVolume)
	if (pnl.gt(BigInt.zero())) th.profit = th.profit.plus(pnl)
	else th.loss = th.loss.plus(pnl)
	th.updateTimestamp = event.block.timestamp
	th.save()
}

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
		let quoteId = event.params.quoteIds[i]
		const rate = event.params.rates[i]
		let quote = QuoteModel.load(quoteId.toString())!
		let account = AccountModel.load(quote.account)!
		const openAmount = quote.quantity.minus(quote.closedAmount)
		const chainQuote = getQuote(event.address, BigInt.fromString(quote.id))!
		const paid = rate.gt(BigInt.zero())
		const funding = unDecimal((chainQuote.openedPrice.minus(quote.openPrice!).abs()).times(openAmount))
		if (paid)
			quote.fundingPaid = quote.fundingPaid.plus(funding)
		else
			quote.fundingReceived = quote.fundingReceived.plus(funding)
		quote.openPrice = chainQuote.openedPrice
		quote.updateTimestamp = event.block.timestamp
		quote.save()

		const dh = getDailyHistoryForTimestamp(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
		)

		if (paid)
			dh.fundingPaid = dh.fundingPaid.plus(funding)
		else dh.fundingReceived = dh.fundingReceived.plus(funding)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
		)
		if (paid)
			th.fundingPaid = th.fundingPaid.plus(funding)
		else th.fundingReceived = th.fundingReceived.plus(funding)
		th.updateTimestamp = event.block.timestamp
		th.save()

		const dailySymbolTradesHistory = getDailySymbolTradesHistory(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
			quote.symbolId,
		)
		if (paid)
			dailySymbolTradesHistory.fundingPaid = dailySymbolTradesHistory.fundingPaid.plus(funding)
		else dailySymbolTradesHistory.fundingReceived = dailySymbolTradesHistory.fundingReceived.plus(funding)
		dailySymbolTradesHistory.save()

		const totalSymbolTradesHistory = getTotalSymbolTradesHistory(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
			quote.symbolId,
		)
		if (paid)
			totalSymbolTradesHistory.fundingPaid = totalSymbolTradesHistory.fundingPaid.plus(funding)
		else totalSymbolTradesHistory.fundingReceived = totalSymbolTradesHistory.fundingReceived.plus(funding)
		totalSymbolTradesHistory.save()
	}
}

// //////////////////////////////////// UnUsed ////////////////////////////////////////

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
}

export function handleTransferAllocation(event: TransferAllocation): void {
}

export function handleActiveEmergencyMode(event: ActiveEmergencyMode): void {
}

export function handleDeactiveEmergencyMode(
	event: DeactiveEmergencyMode,
): void {
}

export function handlePauseAccounting(event: PauseAccounting): void {
}

export function handlePauseGlobal(event: PauseGlobal): void {
}

export function handlePauseLiquidation(event: PauseLiquidation): void {
}

export function handlePausePartyAActions(event: PausePartyAActions): void {
}

export function handlePausePartyBActions(event: PausePartyBActions): void {
}

export function handleRegisterPartyB(event: RegisterPartyB): void {
}

export function handleSetCollateral(event: SetCollateral): void {
	let configuration = getConfiguration(event)
	configuration.collateral = event.params.collateral
	configuration.save()
}

export function handleSetDeallocateCooldown(
	event: SetDeallocateCooldown,
): void {
}

export function handleSetFeeCollector(event: SetFeeCollector): void {
}

export function handleSetForceCancelCloseCooldown(
	event: SetForceCancelCloseCooldown,
): void {
}

export function handleSetForceCancelCooldown(
	event: SetForceCancelCooldown,
): void {
}

export function handleSetForceCloseCooldown(
	event: SetForceCloseCooldown,
): void {
}

export function handleSetForceCloseGapRatio(
	event: SetForceCloseGapRatio,
): void {
}

export function handleSetLiquidationTimeout(
	event: SetLiquidationTimeout,
): void {
}

export function handleSetLiquidatorShare(event: SetLiquidatorShare): void {
}

export function handleSetMuonConfig(event: SetMuonConfig): void {
}

export function handleSetMuonIds(event: SetMuonIds): void {
}

export function handleSetPartyBEmergencyStatus(
	event: SetPartyBEmergencyStatus,
): void {
}

export function handleSetPendingQuotesValidLength(
	event: SetPendingQuotesValidLength,
): void {
}

export function handleSetSuspendedAddress(event: SetSuspendedAddress): void {
}

export function handleSetSymbolAcceptableValues(
	event: SetSymbolAcceptableValues,
): void {
}

export function handleSetSymbolMaxSlippage(event: SetSymbolMaxSlippage): void {
}

export function handleForceCancelCloseRequest(
	event: ForceCancelCloseRequest,
): void {
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
}

export function handleDiamondCut(event: DiamondCut): void {
}

export function handleSetSymbolValidationState(
	event: SetSymbolValidationState,
): void {
}

export function handleUnpauseAccounting(event: UnpauseAccounting): void {
}

export function handleUnpauseGlobal(event: UnpauseGlobal): void {
}

export function handleUnpauseLiquidation(event: UnpauseLiquidation): void {
}

export function handleUnpausePartyAActions(event: UnpausePartyAActions): void {
}

export function handleUnpausePartyBActions(event: UnpausePartyBActions): void {
}

export function handleFullyLiquidatedPartyB(
	event: FullyLiquidatedPartyB,
): void {
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
}
