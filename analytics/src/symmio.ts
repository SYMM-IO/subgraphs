import {BigInt, Bytes, ethereum} from "@graphprotocol/graph-ts";
import {
	AcceptCancelCloseRequest,
	AcceptCancelRequest,
	ActiveEmergencyMode,
	AddSymbol,
	AllocateForPartyB,
	AllocatePartyA,
	AllocatePartyB,
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
} from "../generated/symmio/symmio";
import {
	Account as AccountModel,
	BalanceChange,
	PartyALiquidation,
	PartyALiquidationDisputed,
	PriceCheck,
	Quote as QuoteModel,
	Symbol,
	TradeHistory as TradeHistoryModel,
} from "./../generated/schema";
import {getLiquidatedStateOfPartyA, getQuote} from "./contract_utils";
import {
	createNewAccount,
	createNewUser,
	getDailyHistoryForTimestamp,
	getSymbolTradeVolume,
	getTotalHistory,
	unDecimal,
	updateActivityTimestamps,
	updateDailyOpenInterest,
} from "./utils";

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
	let symbol = new Symbol(event.params.id.toString());
	symbol.name = event.params.name;
	symbol.tradingFee = event.params.tradingFee;
	symbol.timestamp = event.block.timestamp;
	symbol.updateTimestamp = event.block.timestamp;
	symbol.save();
}

export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	let symbol = Symbol.load(event.params.symbolId.toString())!;
	symbol.tradingFee = event.params.tradingFee;
	symbol.updateTimestamp = event.block.timestamp;
	symbol.save();
}


// //////////////////////////////////// Accounting ////////////////////////////////////////
export function handleAllocatePartyA(event: AllocatePartyA): void {
	let account = AccountModel.load(event.params.user.toHexString())!;
	account.allocated = account.allocated.plus(event.params.amount);
	account.updateTimestamp = event.block.timestamp;
	account.save();
	updateActivityTimestamps(account, event.block.timestamp);
	let allocate = new BalanceChange(
		event.transaction.hash.toHex() + "-" + event.logIndex.toHexString()
	);
	allocate.type = "ALLOCATE_PARTY_A";
	allocate.timestamp = event.block.timestamp;
	allocate.blockNumber = event.block.number;
	allocate.transaction = event.transaction.hash;
	allocate.amount = event.params.amount;
	allocate.account = account.id;
	allocate.save();

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.allocate = dh.allocate.plus(allocate.amount);
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.allocate = th.allocate.plus(allocate.amount);
	th.updateTimestamp = event.block.timestamp;
	th.save();
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let account = AccountModel.load(event.params.user.toHexString());
	if (account == null)
		return
	account.deallocated = account.deallocated.plus(event.params.amount);
	account.updateTimestamp = event.block.timestamp;
	account.save();
	updateActivityTimestamps(account, event.block.timestamp);
	let deallocate = new BalanceChange(
		event.transaction.hash.toHex() + "-" + event.logIndex.toHexString()
	);
	deallocate.type = "DEALLOCATE_PARTY_A";
	deallocate.timestamp = event.block.timestamp;
	deallocate.blockNumber = event.block.number;
	deallocate.transaction = event.transaction.hash;
	deallocate.amount = event.params.amount;
	deallocate.account = account.id;
	deallocate.save();

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.deallocate = dh.deallocate.plus(deallocate.amount);
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.deallocate = th.deallocate.plus(deallocate.amount);
	th.updateTimestamp = event.block.timestamp;
	th.save();
}

export function handleDeposit(event: Deposit): void {
	let account = AccountModel.load(event.params.user.toHexString());
	if (account == null) {
		let user = createNewUser(event.params.user.toHexString(), null, event.block, event.transaction);
		account = createNewAccount(event.params.user.toHexString(), user, null, event.block, event.transaction);
	}
	account.deposit = account.deposit.plus(event.params.amount);
	account.save();
	updateActivityTimestamps(account, event.block.timestamp);
	let deposit = new BalanceChange(
		event.transaction.hash.toHex() + "-" + event.logIndex.toHexString()
	);
	deposit.type = "DEPOSIT";
	deposit.timestamp = event.block.timestamp;
	deposit.blockNumber = event.block.number;
	deposit.transaction = event.transaction.hash;
	deposit.amount = event.params.amount;
	deposit.account = account.id;
	deposit.save();

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.deposit = dh.deposit.plus(deposit.amount);
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.deposit = th.deposit.plus(deposit.amount);
	th.updateTimestamp = event.block.timestamp;
	th.save();
}

export function handleWithdraw(event: Withdraw): void {
	let account = AccountModel.load(event.params.sender.toHexString());
	if (account == null) {
		let user = createNewUser(event.params.sender.toHexString(), null, event.block, event.transaction);
		account = createNewAccount(event.params.sender.toHexString(), user, null, event.block, event.transaction);
	}
	account.withdraw = account.withdraw.plus(event.params.amount);
	account.updateTimestamp = event.block.timestamp;
	account.save();
	updateActivityTimestamps(account, event.block.timestamp);
	let withdraw = new BalanceChange(
		event.transaction.hash.toHex() + "-" + event.logIndex.toHexString()
	);
	withdraw.type = "WITHDRAW";
	withdraw.timestamp = event.block.timestamp;
	withdraw.blockNumber = event.block.number;
	withdraw.transaction = event.transaction.hash;
	withdraw.amount = event.params.amount;
	withdraw.account = account.id;
	withdraw.save();

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.withdraw = dh.withdraw.plus(withdraw.amount);
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.withdraw = th.withdraw.plus(withdraw.amount);
	th.updateTimestamp = event.block.timestamp;
	th.save();
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let account = AccountModel.load(event.params.partyB.toHexString())!;
	account.allocated = account.allocated.plus(event.params.amount);
	account.updateTimestamp = event.block.timestamp;
	account.save();
}

export function handleAllocatePartyB(event: AllocatePartyB): void {
	let account = AccountModel.load(event.params.partyB.toHexString())!;
	account.allocated = account.allocated.plus(event.params.amount);
	account.updateTimestamp = event.block.timestamp;
	account.save();
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let account = AccountModel.load(event.params.partyB.toHexString())!;
	account.deallocated = account.deallocated.plus(event.params.amount);
	account.updateTimestamp = event.block.timestamp;
	account.save();
}

// //////////////////////////////////// Main ////////////////////////////////////////
export function handleSendQuote(event: SendQuote): void {
	let account = AccountModel.load(event.params.partyA.toHexString())!;
	account.quotesCount = account.quotesCount.plus(BigInt.fromString("1"));
	account.save();
	updateActivityTimestamps(account, event.block.timestamp);
	let quote = new QuoteModel(event.params.quoteId.toString());
	quote.timestamp = event.block.timestamp;
	quote.updateTimestamp = event.block.timestamp;
	quote.blockNumber = event.block.number;
	quote.transaction = event.transaction.hash;
	if (event.params.partyBsWhiteList) {
		let partyBsWhiteList: Bytes[] = [];
		for (let i = 0, len = event.params.partyBsWhiteList.length; i < len; i++)
			partyBsWhiteList.push(event.params.partyBsWhiteList[i]);
		quote.partyBsWhiteList = partyBsWhiteList;
	}
	quote.symbolId = event.params.symbolId;
	quote.positionType = event.params.positionType;
	quote.orderType = event.params.orderType;
	quote.price = event.params.price;
	quote.marketPrice = event.params.marketPrice;
	quote.deadline = event.params.deadline;
	quote.quantity = event.params.quantity;
	quote.cva = event.params.cva;
	quote.partyAmm = event.params.partyAmm;
	quote.partyBmm = event.params.partyBmm;
	quote.lf = event.params.lf;
	quote.maxFundingRate = event.params.maxFundingRate;
	quote.quoteStatus = QuoteStatus.PENDING;
	quote.account = account.id;
	quote.closedAmount = BigInt.fromString("0");
	quote.avgClosedPrice = BigInt.fromString("0");
	quote.save();

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.quotesCount = dh.quotesCount.plus(BigInt.fromString("1"));
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.quotesCount = th.quotesCount.plus(BigInt.fromString("1"));
	th.updateTimestamp = event.block.timestamp;
	th.save();
}

export function handleExpireQuote(event: ExpireQuote): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!;
	quote.quoteStatus = event.params.quoteStatus;
	quote.updateTimestamp = event.block.timestamp;
	quote.save();
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	let account = AccountModel.load(event.params.partyA.toHexString())!;
	updateActivityTimestamps(account, event.block.timestamp);
}


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let quote = QuoteModel.load(event.params.quoteId.toString());
	if (quote == null)
		return
	quote.quoteStatus = QuoteStatus.CANCELED;
	quote.updateTimestamp = event.block.timestamp;
	quote.save();
}


export function handleLockQuote(event: LockQuote): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!;
	quote.updateTimestamp = event.block.timestamp;
	quote.partyB = event.params.partyB;
	quote.quoteStatus = QuoteStatus.LOCKED;
	quote.save();
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!;
	quote.updateTimestamp = event.block.timestamp;
	quote.partyB = null;
	quote.quoteStatus = QuoteStatus.PENDING;
	quote.save();
}


export function handleOpenPosition(event: OpenPosition): void {
	let account = AccountModel.load(event.params.partyA.toHexString())!;
	account.positionsCount = account.positionsCount.plus(BigInt.fromString("1"));
	account.updateTimestamp = event.block.timestamp;
	account.save();
	let history = new TradeHistoryModel(
		account.id + "-" + event.params.quoteId.toString()
	);
	history.account = account.id;
	history.timestamp = event.block.timestamp;
	history.blockNumber = event.block.number;
	history.transaction = event.transaction.hash;
	history.volume = unDecimal(
		event.params.filledAmount.times(event.params.openedPrice)
	);
	history.quoteStatus = QuoteStatus.OPENED;
	history.quote = event.params.quoteId;
	history.updateTimestamp = event.block.timestamp;
	history.save();

	let quote = QuoteModel.load(event.params.quoteId.toString())!;
	const chainQuote = getQuote(event.address, BigInt.fromString(quote.id))!;
	quote.openPrice = event.params.openedPrice;
	quote.cva = chainQuote.lockedValues.cva;
	quote.lf = chainQuote.lockedValues.lf;
	quote.partyAmm = chainQuote.lockedValues.partyAmm;
	quote.partyBmm = chainQuote.lockedValues.partyBmm;
	quote.quantity = event.params.filledAmount;
	quote.updateTimestamp = event.block.timestamp;
	quote.quoteStatus = QuoteStatus.OPENED;
	quote.save();

	let priceCheck = new PriceCheck(event.transaction.hash.toHexString() + event.transactionLogIndex.toString());
	priceCheck.event = "OpenPosition"
	priceCheck.symbol = Symbol.load(quote.symbolId.toString())!.name;
	priceCheck.givenPrice = event.params.openedPrice;
	priceCheck.timestamp = event.block.timestamp;
	priceCheck.transaction = event.transaction.hash;
	priceCheck.additionalInfo = quote.id;
	priceCheck.save();

	const symbol = Symbol.load(quote.symbolId.toString());

	if (symbol == null)
		return

	let tradingFee = event.params.filledAmount
		.times(quote.openPrice!)
		.times(symbol.tradingFee)
		.div(BigInt.fromString("10").pow(36));

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.tradeVolume = dh.tradeVolume.plus(history.volume);
	dh.openTradeVolume = dh.openTradeVolume.plus(history.volume);
	dh.platformFee = dh.platformFee.plus(tradingFee);
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.tradeVolume = th.tradeVolume.plus(history.volume);
	th.openTradeVolume = th.openTradeVolume.plus(history.volume);
	th.platformFee = th.platformFee.plus(tradingFee);
	th.updateTimestamp = event.block.timestamp;
	th.save();

	let stv = getSymbolTradeVolume(quote.symbolId, event.block.timestamp, account.accountSource);
	stv.volume = stv.volume.plus(history.volume);
	stv.updateTimestamp = event.block.timestamp;
	stv.save();

	updateDailyOpenInterest(event.block.timestamp, history.volume, true, account.accountSource);
}

export function handleRequestToClosePosition(
	event: RequestToClosePosition
): void {
	let account = AccountModel.load(event.params.partyA.toHexString())!;
	updateActivityTimestamps(account, event.block.timestamp);

	let quote = QuoteModel.load(event.params.quoteId.toString())!;
	quote.quoteStatus = QuoteStatus.CLOSE_PENDING;
	quote.updateTimestamp = event.block.timestamp;
	quote.save();
}

export function handleRequestToCancelCloseRequest(
	event: RequestToCancelCloseRequest
): void {
	let account = AccountModel.load(event.params.partyA.toHexString())!;
	updateActivityTimestamps(account, event.block.timestamp);
}

export function handleAcceptCancelCloseRequest(
	event: AcceptCancelCloseRequest
): void {
	let quote = QuoteModel.load(event.params.quoteId.toString())!;
	quote.quoteStatus = QuoteStatus.OPENED;
	quote.save();
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	handleClose(event, "FillCloseRequest")
}

export function handleEmergencyClosePosition(
	event: EmergencyClosePosition
): void {
	handleClose(event, "EmergencyClosePosition")
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	handleClose(event, "ForceClosePosition")
}

export function handleLiquidatePositionsPartyA(
	event: LiquidatePositionsPartyA
): void {
	for (let i = 0; i < event.params.quoteIds.length; i++) {
		const qId = event.params.quoteIds[i];
		handleLiquidatePosition(event, qId);
	}
}

export function handleLiquidatePositionsPartyB(
	event: LiquidatePositionsPartyB
): void {
	for (let i = 0; i < event.params.quoteIds.length; i++) {
		const qId = event.params.quoteIds[i];
		handleLiquidatePosition(event, qId);
	}
}

export function handleSetSymbolsPrices(
	event: SetSymbolsPrices
): void {
	const liquidationDetail = getLiquidatedStateOfPartyA(event.address, event.params.partyA);
	if (liquidationDetail == null)
		return;
	let model = new PartyALiquidation(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())
	model.partyA = event.params.partyA;
	model.liquidator = event.params.liquidator;
	model.liquidationType = liquidationDetail.liquidationType;
	model.timestamp = event.block.timestamp;
	model.transaction = event.transaction.hash;
	model.save();
}

export function handleLiquidationDisputed(
	event: LiquidationDisputed
): void {
	let model = new PartyALiquidationDisputed(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())
	model.partyA = event.params.partyA;
	model.timestamp = event.block.timestamp;
	model.transaction = event.transaction.hash;
	model.save();
}

function handleLiquidatePosition(_event: ethereum.Event, qId: BigInt): void {
	const event = changetype<LiquidatePositionsPartyA>(_event);
	let history = TradeHistoryModel.load(
		event.params.partyA.toHexString() + "-" + qId.toString()
	)!;
	const quote = QuoteModel.load(qId.toString())!;
	quote.quoteStatus = QuoteStatus.LIQUIDATED;
	quote.updateTimestamp = event.block.timestamp;
	quote.liquidatedSide = 1
	quote.save();
	const chainQuote = getQuote(event.address, qId);
	if (chainQuote == null)
		return;
	const liquidAmount = quote.quantity.minus(quote.closedAmount);
	const liquidPrice = chainQuote.avgClosedPrice
		.times(quote.quantity)
		.minus(
			quote.avgClosedPrice
				.times(quote.closedAmount)
		)
		.div(liquidAmount);
	const additionalVolume = liquidAmount
		.times(liquidPrice)
		.div(BigInt.fromString("10").pow(18));
	history.volume = history.volume.plus(additionalVolume);
	history.quoteStatus = QuoteStatus.LIQUIDATED;
	history.updateTimestamp = event.block.timestamp;
	history.quote = qId;
	history.save();

	quote.avgClosedPrice = chainQuote.avgClosedPrice;
	quote.save();
	let account = AccountModel.load(quote.account)!;

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.tradeVolume = dh.tradeVolume.plus(additionalVolume);
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.tradeVolume = th.tradeVolume.plus(additionalVolume);
	th.updateTimestamp = event.block.timestamp;
	th.save();

	let stv = getSymbolTradeVolume(quote.symbolId, event.block.timestamp, account.accountSource);
	stv.volume = stv.volume.plus(additionalVolume);
	stv.updateTimestamp = event.block.timestamp;
	stv.save();

	updateDailyOpenInterest(
		event.block.timestamp,
		unDecimal(liquidAmount.times(quote.openPrice!)),
		false,
		account.accountSource
	);
}

function handleClose(_event: ethereum.Event, name: string): void {
	const event = changetype<FillCloseRequest>(_event) // FillClose, ForceClose, EmergencyClose all have the same event signature
	let quote = QuoteModel.load(event.params.quoteId.toString())!;
	quote.avgClosedPrice = quote.avgClosedPrice
		.times(quote.closedAmount)
		.plus(event.params.filledAmount.times(event.params.closedPrice))
		.div(quote.closedAmount.plus(event.params.filledAmount));
	quote.closedAmount = quote.closedAmount.plus(event.params.filledAmount);
	if (quote.closedAmount.equals(quote.quantity))
		quote.quoteStatus = QuoteStatus.CLOSED;
	quote.updateTimestamp = event.block.timestamp;
	quote.save();
	let history = TradeHistoryModel.load(
		event.params.partyA.toHexString() + "-" + event.params.quoteId.toString()
	)!;
	const additionalVolume = event.params.filledAmount
		.times(event.params.closedPrice)
		.div(BigInt.fromString("10").pow(18));
	history.volume = history.volume.plus(additionalVolume);
	history.updateTimestamp = event.block.timestamp;
	history.quoteStatus = quote.quoteStatus;
	history.quote = event.params.quoteId;
	history.save();

	let priceCheck = new PriceCheck(event.transaction.hash.toHexString() + event.transactionLogIndex.toString());
	priceCheck.event = name
	priceCheck.symbol = Symbol.load(quote.symbolId.toString())!.name;
	priceCheck.givenPrice = event.params.closedPrice;
	priceCheck.timestamp = event.block.timestamp;
	priceCheck.transaction = event.transaction.hash;
	priceCheck.additionalInfo = quote.id;
	priceCheck.save();

	let account = AccountModel.load(event.params.partyA.toHexString())!;

	const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource);
	dh.tradeVolume = dh.tradeVolume.plus(additionalVolume);
	dh.closeTradeVolume = dh.closeTradeVolume.plus(additionalVolume);
	dh.updateTimestamp = event.block.timestamp;
	dh.save();

	const th = getTotalHistory(event.block.timestamp, account.accountSource);
	th.tradeVolume = th.tradeVolume.plus(additionalVolume);
	th.closeTradeVolume = th.closeTradeVolume.plus(additionalVolume);
	th.updateTimestamp = event.block.timestamp;
	th.save();

	let stv = getSymbolTradeVolume(quote.symbolId, event.block.timestamp, account.accountSource);
	stv.volume = stv.volume.plus(additionalVolume);
	stv.updateTimestamp = event.block.timestamp;
	stv.save();

	updateDailyOpenInterest(
		event.block.timestamp,
		unDecimal(event.params.filledAmount.times(quote.openPrice!)),
		false,
		account.accountSource
	);
}


// //////////////////////////////////// UnUsed ////////////////////////////////////////

export function handleTransferAllocation(event: TransferAllocation): void {
}

export function handleActiveEmergencyMode(event: ActiveEmergencyMode): void {
}


export function handleDeactiveEmergencyMode(
	event: DeactiveEmergencyMode
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
}

export function handleSetDeallocateCooldown(
	event: SetDeallocateCooldown
): void {
}

export function handleSetFeeCollector(event: SetFeeCollector): void {
}

export function handleSetForceCancelCloseCooldown(
	event: SetForceCancelCloseCooldown
): void {
}

export function handleSetForceCancelCooldown(
	event: SetForceCancelCooldown
): void {
}

export function handleSetForceCloseCooldown(
	event: SetForceCloseCooldown
): void {
}

export function handleSetForceCloseGapRatio(
	event: SetForceCloseGapRatio
): void {
}

export function handleSetLiquidationTimeout(
	event: SetLiquidationTimeout
): void {
}

export function handleSetLiquidatorShare(event: SetLiquidatorShare): void {
}

export function handleSetMuonConfig(event: SetMuonConfig): void {
}

export function handleSetMuonIds(event: SetMuonIds): void {
}

export function handleSetPartyBEmergencyStatus(
	event: SetPartyBEmergencyStatus
): void {
}

export function handleSetPendingQuotesValidLength(
	event: SetPendingQuotesValidLength
): void {
}

export function handleSetSuspendedAddress(event: SetSuspendedAddress): void {
}

export function handleSetSymbolAcceptableValues(
	event: SetSymbolAcceptableValues
): void {
}

export function handleSetSymbolMaxSlippage(event: SetSymbolMaxSlippage): void {
}


export function handleForceCancelCloseRequest(
	event: ForceCancelCloseRequest
): void {
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
}

export function handleDiamondCut(event: DiamondCut): void {
}

export function handleSetSymbolValidationState(
	event: SetSymbolValidationState
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
	event: FullyLiquidatedPartyB
): void {
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
}

// let lastActionTimestamp: BigInt = BigInt.zero();

// export function handleBlockWithCall(block: ethereum.Block): void {
//   const blockTimestamp = block.timestamp;
//   if (blockTimestamp.minus(lastActionTimestamp).gt(BigInt.fromI32(600))) {
//     let oi = getOpenInterest(block.timestamp);
//     let dh = getDailyHistoryForTimestamp(blockTimestamp);
//     if (isSameDay(blockTimestamp, oi.timestamp)) {
//       oi.count = oi.count.plus(BigInt.fromString("1"));
//       oi.accumulatedAmount = oi.accumulatedAmount.plus(oi.amount);
//       dh.openInterest = oi.accumulatedAmount.div(oi.count);
//     } else {
//       dh.openInterest = oi.amount;
//       oi.count = BigInt.fromString("1");
//       oi.accumulatedAmount = oi.amount;
//     }
//     oi.save();
//     dh.save();
//     lastActionTimestamp = blockTimestamp;
//   }
// }
