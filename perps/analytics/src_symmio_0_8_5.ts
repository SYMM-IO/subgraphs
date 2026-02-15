import { AcceptCancelCloseRequestHandler } from "./handlers/symmio/AcceptCancelCloseRequestHandler"
import {
	AcceptCancelCloseRequest,
	AcceptCancelRequest,
	ADLClose,
	AddBridge,
	AddSymbol,
	AllocateForPartyB,
	AllocatePartyA,
	BalanceChangePartyA,
	BalanceChangePartyB,
	ChargeAccumulatedFundingFee,
	ChargeFundingRate,
	DeallocateForPartyB,
	DeallocatePartyA,
	DeferredLiquidatePartyA,
	Deposit,
	Deposit1,
	EmergencyClosePosition,
	ExpireQuoteClose,
	ExpireQuoteOpen,
	FillCloseRequest,
	FillCloseRequest1,
	ForceCancelCloseRequest,
	ForceCancelQuote,
	ForceClosePartyBInsolvent,
	ForceClosePosition,
	LiquidatePartyA,
	LiquidatePartyB,
	LiquidatePendingPositionsPartyA,
	LiquidatePositionsForClearingHouse,
	LiquidatePositionsPartyA,
	LiquidatePositionsPartyA1,
	LiquidatePositionsPartyB,
	LiquidatePositionsPartyB1,
	LiquidationDisputed,
	LockQuote,
	OpenPosition,
	OpenPosition1,
	RegisterPartyB,
	RequestToCancelCloseRequest,
	RequestToCancelQuote,
	RequestToClosePosition,
	RoleGranted,
	RoleRevoked,
	SendQuote,
	SendQuote1,
	SetCollateral,
	SetFeeCollector,
	SetSymbolFundingState,
	SetSymbolsPrices,
	SetSymbolTradingFee,
	SetSymbolValidationState,
	SettlePartyALiquidation,
	SettleUpnl,
	SettleUpnlUnified,
	SoftPartyBLiquidation,
	TakeoverPartyALiquidation,
	TradingFeeCharged,
	TransferToBridge,
	UnlockQuote,
	Withdraw,
	WithdrawFinalized,
	WithdrawInitiated,
} from "../../generated/symmio_0_8_5/symmio_0_8_5"
import { AcceptCancelRequestHandler } from "./handlers/symmio/AcceptCancelRequestHandler"
import { ADLCloseHandler } from "./handlers/symmio/ADLCloseHandler"
import { AddBridgeHandler } from "./handlers/symmio/AddBridgeHandler"
import { AddSymbolHandler } from "./handlers/symmio/AddSymbolHandler"
import { AllocateForPartyBHandler } from "./handlers/symmio/AllocateForPartyBHandler"
import { AllocatePartyAHandler } from "./handlers/symmio/AllocatePartyAHandler"
import { BalanceChangePartyAHandler } from "./handlers/symmio/BalanceChangePartyAHandler"
import { BalanceChangePartyBHandler } from "./handlers/symmio/BalanceChangePartyBHandler"
import { ChargeAccumulatedFundingFeeHandler } from "./handlers/symmio/ChargeAccumulatedFundingFeeHandler"
import { ChargeFundingRateHandler } from "./handlers/symmio/ChargeFundingRateHandler"
import { DeallocateForPartyBHandler } from "./handlers/symmio/DeallocateForPartyBHandler"
import { DeallocatePartyAHandler } from "./handlers/symmio/DeallocatePartyAHandler"
import { DepositHandler } from "./handlers/symmio/DepositHandler"
import { EmergencyClosePositionHandler } from "./handlers/symmio/EmergencyClosePositionHandler"
import { ExpireQuoteHandler } from "./handlers/symmio/ExpireQuoteHandler"
import { FillCloseRequestHandler } from "./handlers/symmio/FillCloseRequestHandler"
import { ForceCancelCloseRequestHandler } from "./handlers/symmio/ForceCancelCloseRequestHandler"
import { ForceCancelQuoteHandler } from "./handlers/symmio/ForceCancelQuoteHandler"
import { ForceClosePartyBInsolventHandler } from "./handlers/symmio/ForceClosePartyBInsolventHandler"
import { ForceClosePositionHandler } from "./handlers/symmio/ForceClosePositionHandler"
import { LiquidatePartyAHandler } from "./handlers/symmio/LiquidatePartyAHandler"
import { LiquidatePartyBHandler } from "./handlers/symmio/LiquidatePartyBHandler"
import { LiquidatePendingPositionsPartyAHandler } from "./handlers/symmio/LiquidatePendingPositionsPartyAHandler"
import { LiquidatePositionsForClearingHouseHandler } from "./handlers/symmio/LiquidatePositionsForClearingHouseHandler"
import { LiquidatePositionsPartyAHandler } from "./handlers/symmio/LiquidatePositionsPartyAHandler"
import { LiquidatePositionsPartyBHandler } from "./handlers/symmio/LiquidatePositionsPartyBHandler"
import { LockQuoteHandler } from "./handlers/symmio/LockQuoteHandler"
import { OpenPositionHandler } from "./handlers/symmio/OpenPositionHandler"
import { RegisterPartyBHandler } from "./handlers/symmio/RegisterPartyBHandler"
import { RequestToCancelCloseRequestHandler } from "./handlers/symmio/RequestToCancelCloseRequestHandler"
import { RequestToCancelQuoteHandler } from "./handlers/symmio/RequestToCancelQuoteHandler"
import { RequestToClosePositionHandler } from "./handlers/symmio/RequestToClosePositionHandler"
import { RoleGrantedHandler } from "./handlers/symmio/RoleGrantedHandler"
import { RoleRevokedHandler } from "./handlers/symmio/RoleRevokedHandler"
import { SendQuoteHandler } from "./handlers/symmio/SendQuoteHandler"
import { SetCollateralHandler } from "./handlers/symmio/SetCollateralHandler"
import { SetSymbolTradingFeeHandler } from "./handlers/symmio/SetSymbolTradingFeeHandler"
import { UnlockQuoteHandler } from "./handlers/symmio/UnlockQuoteHandler"
import { Version } from "../common/BaseHandler"
import { WithdrawHandler } from "./handlers/symmio/WithdrawHandler"
import { WithdrawInitiatedHandler } from "./handlers/symmio/WithdrawInitiatedHandler"
import { WithdrawFinalizedHandler } from "./handlers/symmio/WithdrawFinalizedHandler"
import { SetSymbolValidationStateHandler } from "./handlers/symmio/SetSymbolValidationStateHandler"
import { SetSymbolFundingStateHandler } from "./handlers/symmio/SetSymbolFundingStateHandler"
import { SettleUpnlHandler } from "./handlers/symmio/SettleUpnlHandler"
import { SettleUpnlUnifiedHandler } from "./handlers/symmio/SettleUpnlUnifiedHandler"
import { SetFeeCollectorHandler } from "./handlers/symmio/SetFeeCollectorHandler"
import { TransferToBridgeHandler } from "./handlers/symmio/TransferToBridgeHandler"
import { SettlePartyALiquidationHandler } from "./handlers/symmio/SettlePartyALiquidationHandler"
import { SoftPartyBLiquidationHandler } from "./handlers/symmio/SoftPartyBLiquidationHandler"
import { TakeoverPartyALiquidationHandler } from "./handlers/symmio/TakeoverPartyALiquidationHandler"
import { TradingFeeChargedHandler } from "./handlers/symmio/TradingFeeChargedHandler"
import { DeferredLiquidatePartyAHandler } from "../common/handlers/symmio/DeferredLiquidatePartyAHandler"
import { SetSymbolsPricesHandler } from "./handlers/symmio/SetSymbolsPricesHandler"
import { LiquidationDisputedHandler } from "./handlers/symmio/LiquidationDisputedHandler"

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleADLClose(event: ADLClose): void {
	let handler = new ADLCloseHandler<ADLClose>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleAddBridge(event: AddBridge): void {
	let handler = new AddBridgeHandler<AddBridge>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleAddSymbol(event: AddSymbol): void {
	let handler = new AddSymbolHandler<AddSymbol>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler<AllocatePartyA>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleBalanceChangePartyA(event: BalanceChangePartyA): void {
	let handler = new BalanceChangePartyAHandler<BalanceChangePartyA>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleBalanceChangePartyB(event: BalanceChangePartyB): void {
	let handler = new BalanceChangePartyBHandler<BalanceChangePartyB>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleChargeAccumulatedFundingFee(event: ChargeAccumulatedFundingFee): void {
	let handler = new ChargeAccumulatedFundingFeeHandler<ChargeAccumulatedFundingFee>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleDeposit(event: Deposit): void {
	let handler = new DepositHandler<Deposit>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleDeposit1(event: Deposit1): void {
	let handler = new DepositHandler<Deposit1>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleExpireQuoteOpen(event: ExpireQuoteOpen): void {
	let handler = new ExpireQuoteHandler<ExpireQuoteOpen>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleExpireQuoteClose(event: ExpireQuoteClose): void {
	let handler = new ExpireQuoteHandler<ExpireQuoteClose>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler<FillCloseRequest>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleFillCloseRequest1(event: FillCloseRequest1): void {
	let handler = new FillCloseRequestHandler<FillCloseRequest1>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
	let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleForceClosePartyBInsolvent(event: ForceClosePartyBInsolvent): void {
	let handler = new ForceClosePartyBInsolventHandler<ForceClosePartyBInsolvent>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler<ForceClosePosition>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePositionsForClearingHouse(event: LiquidatePositionsForClearingHouse): void {
	let handler = new LiquidatePositionsForClearingHouseHandler<LiquidatePositionsForClearingHouse>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePositionsPartyA1(event: LiquidatePositionsPartyA1): void {
	let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA1>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidatePositionsPartyB1(event: LiquidatePositionsPartyB1): void {
	let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB1>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLiquidationDisputed(event: LiquidationDisputed): void {
	let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler<LockQuote>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler<OpenPosition>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleOpenPosition1(event: OpenPosition1): void {
	let handler = new OpenPositionHandler<OpenPosition1>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleRegisterPartyB(event: RegisterPartyB): void {
	let handler = new RegisterPartyBHandler<RegisterPartyB>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler<SendQuote>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSendQuote1(event: SendQuote1): void {
	let handler = new SendQuoteHandler<SendQuote1>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSetCollateral(event: SetCollateral): void {
	let handler = new SetCollateralHandler<SetCollateral>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
	let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSetSymbolFundingState(event: SetSymbolFundingState): void {
	let handler = new SetSymbolFundingStateHandler<SetSymbolFundingState>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler<UnlockQuote>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleWithdraw(event: Withdraw): void {
	let handler = new WithdrawHandler<Withdraw>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleWithdrawInitiated(event: WithdrawInitiated): void {
	let handler = new WithdrawInitiatedHandler<WithdrawInitiated>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleWithdrawFinalized(event: WithdrawFinalized): void {
	let handler = new WithdrawFinalizedHandler<WithdrawFinalized>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSettleUpnl(event: SettleUpnl): void {
	let handler = new SettleUpnlHandler<SettleUpnl>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSettleUpnlUnified(event: SettleUpnlUnified): void {
	let handler = new SettleUpnlUnifiedHandler<SettleUpnlUnified>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSetFeeCollector(event: SetFeeCollector): void {
	let handler = new SetFeeCollectorHandler<SetFeeCollector>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleTransferToBridge(event: TransferToBridge): void {
	let handler = new TransferToBridgeHandler<TransferToBridge>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
	let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSoftPartyBLiquidation(event: SoftPartyBLiquidation): void {
	let handler = new SoftPartyBLiquidationHandler<SoftPartyBLiquidation>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleTakeoverPartyALiquidation(event: TakeoverPartyALiquidation): void {
	let handler = new TakeoverPartyALiquidationHandler<TakeoverPartyALiquidation>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleTradingFeeCharged(event: TradingFeeCharged): void {
	let handler = new TradingFeeChargedHandler<TradingFeeCharged>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleDeferredLiquidatePartyA(event: DeferredLiquidatePartyA): void {
	let handler = new DeferredLiquidatePartyAHandler<DeferredLiquidatePartyA>()
	handler.handle(event, Version.v_0_8_5)
}

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
	handler.handle(event, Version.v_0_8_5)
}
