import { AcceptCancelCloseRequestHandler } from "./handlers/symmio/AcceptCancelCloseRequestHandler"
import {
	AcceptCancelCloseRequest,
	AcceptCancelRequest,
	ActiveEmergencyMode,
	AddBridge,
	AddSymbol,
	AllocateForPartyB,
	AllocatePartyA,
	AllocatePartyB,
	ChargeFundingRate,
	DeactiveEmergencyMode,
	DeallocateForPartyB,
	DeallocatePartyA,
	DeferredLiquidatePartyA,
	Deposit,
	DeregisterAffiliate,
	DeregisterPartyB,
	DisputeForLiquidation,
	EmergencyClosePosition,
	ExpireQuoteClose,
	ExpireQuoteOpen,
	FillCloseRequest,
	ForceCancelCloseRequest,
	ForceCancelQuote,
	ForceClosePosition,
	FullyLiquidatedPartyA,
	FullyLiquidatedPartyB,
	InternalTransfer,
	LiquidatePartyA,
	LiquidatePartyB,
	LiquidatePendingPositionsPartyA,
	LiquidatePositionsPartyA,
	LiquidatePositionsPartyB,
	LiquidationDisputed,
	LockQuote,
	OpenPosition,
	PauseAccounting,
	PauseGlobal,
	PauseInternalTransfer,
	PauseLiquidation,
	PausePartyAActions,
	PausePartyBActions,
	RegisterAffiliate,
	RegisterPartyB,
	RemoveBridge,
	RequestToCancelCloseRequest,
	RequestToCancelQuote,
	RequestToClosePosition,
	ResolveLiquidationDispute,
	RestoreBridgeTransaction,
	RoleGranted,
	RoleRevoked,
	SendQuote,
	SetBalanceLimitPerUser,
	SetCollateral,
	SetDeallocateCooldown,
	SetDeallocateDebounceTime,
	SetDefaultFeeCollector,
	SetFeeCollector,
	SetForceCancelCloseCooldown,
	SetForceCancelCooldown,
	SetForceCloseCooldowns,
	SetForceCloseGapRatio,
	SetForceCloseMinSigPeriod,
	SetForceClosePricePenalty,
	SetInvalidBridgedAmountsPool,
	SetLiquidationTimeout,
	SetLiquidatorShare,
	SetMuonConfig,
	SetMuonIds,
	SetPartyBEmergencyStatus,
	SetPendingQuotesValidLength,
	SetSuspendedAddress,
	SetSymbolAcceptableValues,
	SetSymbolFundingState,
	SetSymbolMaxLeverage,
	SetSymbolMaxSlippage,
	SetSymbolsPrices,
	SetSymbolTradingFee,
	SetSymbolValidationState,
	SettlePartyALiquidation,
	SuspendBridgeTransaction,
	TransferAllocation,
	TransferToBridge,
	UnlockQuote,
	UnpauseAccounting,
	UnpauseGlobal,
	UnpauseInternalTransfer,
	UnpauseLiquidation,
	UnpausePartyAActions,
	UnpausePartyBActions,
	Withdraw,
	WithdrawReceivedBridgeValue,
	WithdrawReceivedBridgeValues,
} from "../generated/symmio_0_8_3/symmio_0_8_3"
import { AcceptCancelRequestHandler } from "./handlers/symmio/AcceptCancelRequestHandler"
import { ActiveEmergencyModeHandler } from "./handlers/symmio/ActiveEmergencyModeHandler"
import { AddBridgeHandler } from "./handlers/symmio/AddBridgeHandler"
import { AddSymbolHandler } from "./handlers/symmio/AddSymbolHandler"
import { AllocateForPartyBHandler } from "./handlers/symmio/AllocateForPartyBHandler"
import { AllocatePartyAHandler } from "./handlers/symmio/AllocatePartyAHandler"
import { AllocatePartyBHandler } from "./handlers/symmio/AllocatePartyBHandler"
import { ChargeFundingRateHandler } from "./handlers/symmio/ChargeFundingRateHandler"
import { DeactiveEmergencyModeHandler } from "./handlers/symmio/DeactiveEmergencyModeHandler"
import { DeallocateForPartyBHandler } from "./handlers/symmio/DeallocateForPartyBHandler"
import { DeallocatePartyAHandler } from "./handlers/symmio/DeallocatePartyAHandler"
import { DeferredLiquidatePartyAHandler } from "./handlers/symmio/DeferredLiquidatePartyAHandler"
import { DepositHandler } from "./handlers/symmio/DepositHandler"
import { DeregisterAffiliateHandler } from "./handlers/symmio/DeregisterAffiliateHandler"
import { DeregisterPartyBHandler } from "./handlers/symmio/DeregisterPartyBHandler"
import { DisputeForLiquidationHandler } from "./handlers/symmio/DisputeForLiquidationHandler"
import { EmergencyClosePositionHandler } from "./handlers/symmio/EmergencyClosePositionHandler"
import { ExpireQuoteCloseHandler } from "./handlers/symmio/ExpireQuoteCloseHandler"
import { ExpireQuoteOpenHandler } from "./handlers/symmio/ExpireQuoteOpenHandler"
import { FillCloseRequestHandler } from "./handlers/symmio/FillCloseRequestHandler"
import { ForceCancelCloseRequestHandler } from "./handlers/symmio/ForceCancelCloseRequestHandler"
import { ForceCancelQuoteHandler } from "./handlers/symmio/ForceCancelQuoteHandler"
import { ForceClosePositionHandler } from "./handlers/symmio/ForceClosePositionHandler"
import { FullyLiquidatedPartyAHandler } from "./handlers/symmio/FullyLiquidatedPartyAHandler"
import { FullyLiquidatedPartyBHandler } from "./handlers/symmio/FullyLiquidatedPartyBHandler"
import { InternalTransferHandler } from "./handlers/symmio/InternalTransferHandler"
import { LiquidatePartyAHandler } from "./handlers/symmio/LiquidatePartyAHandler"
import { LiquidatePartyBHandler } from "./handlers/symmio/LiquidatePartyBHandler"
import { LiquidatePendingPositionsPartyAHandler } from "./handlers/symmio/LiquidatePendingPositionsPartyAHandler"
import { LiquidatePositionsPartyAHandler } from "./handlers/symmio/LiquidatePositionsPartyAHandler"
import { LiquidatePositionsPartyBHandler } from "./handlers/symmio/LiquidatePositionsPartyBHandler"
import { LiquidationDisputedHandler } from "./handlers/symmio/LiquidationDisputedHandler"
import { LockQuoteHandler } from "./handlers/symmio/LockQuoteHandler"
import { OpenPositionHandler } from "./handlers/symmio/OpenPositionHandler"
import { PauseAccountingHandler } from "./handlers/symmio/PauseAccountingHandler"
import { PauseGlobalHandler } from "./handlers/symmio/PauseGlobalHandler"
import { PauseInternalTransferHandler } from "./handlers/symmio/PauseInternalTransferHandler"
import { PauseLiquidationHandler } from "./handlers/symmio/PauseLiquidationHandler"
import { PausePartyAActionsHandler } from "./handlers/symmio/PausePartyAActionsHandler"
import { PausePartyBActionsHandler } from "./handlers/symmio/PausePartyBActionsHandler"
import { RegisterAffiliateHandler } from "./handlers/symmio/RegisterAffiliateHandler"
import { RegisterPartyBHandler } from "./handlers/symmio/RegisterPartyBHandler"
import { RemoveBridgeHandler } from "./handlers/symmio/RemoveBridgeHandler"
import { RequestToCancelCloseRequestHandler } from "./handlers/symmio/RequestToCancelCloseRequestHandler"
import { RequestToCancelQuoteHandler } from "./handlers/symmio/RequestToCancelQuoteHandler"
import { RequestToClosePositionHandler } from "./handlers/symmio/RequestToClosePositionHandler"
import { ResolveLiquidationDisputeHandler } from "./handlers/symmio/ResolveLiquidationDisputeHandler"
import { RestoreBridgeTransactionHandler } from "./handlers/symmio/RestoreBridgeTransactionHandler"
import { RoleGrantedHandler } from "./handlers/symmio/RoleGrantedHandler"
import { RoleRevokedHandler } from "./handlers/symmio/RoleRevokedHandler"
import { SendQuoteHandler } from "./handlers/symmio/SendQuoteHandler"
import { SetBalanceLimitPerUserHandler } from "./handlers/symmio/SetBalanceLimitPerUserHandler"
import { SetCollateralHandler } from "./handlers/symmio/SetCollateralHandler"
import { SetDeallocateCooldownHandler } from "./handlers/symmio/SetDeallocateCooldownHandler"
import { SetDeallocateDebounceTimeHandler } from "./handlers/symmio/SetDeallocateDebounceTimeHandler"
import { SetDefaultFeeCollectorHandler } from "./handlers/symmio/SetDefaultFeeCollectorHandler"
import { SetFeeCollectorHandler } from "./handlers/symmio/SetFeeCollectorHandler"
import { SetForceCancelCloseCooldownHandler } from "./handlers/symmio/SetForceCancelCloseCooldownHandler"
import { SetForceCancelCooldownHandler } from "./handlers/symmio/SetForceCancelCooldownHandler"
import { SetForceCloseCooldownsHandler } from "./handlers/symmio/SetForceCloseCooldownsHandler"
import { SetForceCloseGapRatioHandler } from "./handlers/symmio/SetForceCloseGapRatioHandler"
import { SetForceCloseMinSigPeriodHandler } from "./handlers/symmio/SetForceCloseMinSigPeriodHandler"
import { SetForceClosePricePenaltyHandler } from "./handlers/symmio/SetForceClosePricePenaltyHandler"
import { SetInvalidBridgedAmountsPoolHandler } from "./handlers/symmio/SetInvalidBridgedAmountsPoolHandler"
import { SetLiquidationTimeoutHandler } from "./handlers/symmio/SetLiquidationTimeoutHandler"
import { SetLiquidatorShareHandler } from "./handlers/symmio/SetLiquidatorShareHandler"
import { SetMuonConfigHandler } from "./handlers/symmio/SetMuonConfigHandler"
import { SetMuonIdsHandler } from "./handlers/symmio/SetMuonIdsHandler"
import { SetPartyBEmergencyStatusHandler } from "./handlers/symmio/SetPartyBEmergencyStatusHandler"
import { SetPendingQuotesValidLengthHandler } from "./handlers/symmio/SetPendingQuotesValidLengthHandler"
import { SetSuspendedAddressHandler } from "./handlers/symmio/SetSuspendedAddressHandler"
import { SetSymbolAcceptableValuesHandler } from "./handlers/symmio/SetSymbolAcceptableValuesHandler"
import { SetSymbolFundingStateHandler } from "./handlers/symmio/SetSymbolFundingStateHandler"
import { SetSymbolMaxLeverageHandler } from "./handlers/symmio/SetSymbolMaxLeverageHandler"
import { SetSymbolMaxSlippageHandler } from "./handlers/symmio/SetSymbolMaxSlippageHandler"
import { SetSymbolTradingFeeHandler } from "./handlers/symmio/SetSymbolTradingFeeHandler"
import { SetSymbolValidationStateHandler } from "./handlers/symmio/SetSymbolValidationStateHandler"
import { SetSymbolsPricesHandler } from "./handlers/symmio/SetSymbolsPricesHandler"
import { SettlePartyALiquidationHandler } from "./handlers/symmio/SettlePartyALiquidationHandler"
import { SuspendBridgeTransactionHandler } from "./handlers/symmio/SuspendBridgeTransactionHandler"
import { TransferAllocationHandler } from "./handlers/symmio/TransferAllocationHandler"
import { TransferToBridgeHandler } from "./handlers/symmio/TransferToBridgeHandler"
import { UnlockQuoteHandler } from "./handlers/symmio/UnlockQuoteHandler"
import { UnpauseAccountingHandler } from "./handlers/symmio/UnpauseAccountingHandler"
import { UnpauseGlobalHandler } from "./handlers/symmio/UnpauseGlobalHandler"
import { UnpauseInternalTransferHandler } from "./handlers/symmio/UnpauseInternalTransferHandler"
import { UnpauseLiquidationHandler } from "./handlers/symmio/UnpauseLiquidationHandler"
import { UnpausePartyAActionsHandler } from "./handlers/symmio/UnpausePartyAActionsHandler"
import { UnpausePartyBActionsHandler } from "./handlers/symmio/UnpausePartyBActionsHandler"
import { Version } from "../common/BaseHandler"
import { WithdrawHandler } from "./handlers/symmio/WithdrawHandler"
import { WithdrawReceivedBridgeValueHandler } from "./handlers/symmio/WithdrawReceivedBridgeValueHandler"
import { WithdrawReceivedBridgeValuesHandler } from "./handlers/symmio/WithdrawReceivedBridgeValuesHandler"

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleActiveEmergencyMode(event: ActiveEmergencyMode): void {
	let handler = new ActiveEmergencyModeHandler<ActiveEmergencyMode>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleAddBridge(event: AddBridge): void {
	let handler = new AddBridgeHandler<AddBridge>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleAddSymbol(event: AddSymbol): void {
	let handler = new AddSymbolHandler<AddSymbol>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler<AllocatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleAllocatePartyB(event: AllocatePartyB): void {
	let handler = new AllocatePartyBHandler<AllocatePartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDeactiveEmergencyMode(event: DeactiveEmergencyMode): void {
	let handler = new DeactiveEmergencyModeHandler<DeactiveEmergencyMode>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDeferredLiquidatePartyA(event: DeferredLiquidatePartyA): void {
	let handler = new DeferredLiquidatePartyAHandler<DeferredLiquidatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDeposit(event: Deposit): void {
	let handler = new DepositHandler<Deposit>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDeregisterAffiliate(event: DeregisterAffiliate): void {
	let handler = new DeregisterAffiliateHandler<DeregisterAffiliate>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDeregisterPartyB(event: DeregisterPartyB): void {
	let handler = new DeregisterPartyBHandler<DeregisterPartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleDisputeForLiquidation(event: DisputeForLiquidation): void {
	let handler = new DisputeForLiquidationHandler<DisputeForLiquidation>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleExpireQuoteClose(event: ExpireQuoteClose): void {
	let handler = new ExpireQuoteCloseHandler<ExpireQuoteClose>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleExpireQuoteOpen(event: ExpireQuoteOpen): void {
	let handler = new ExpireQuoteOpenHandler<ExpireQuoteOpen>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler<FillCloseRequest>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
	let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler<ForceClosePosition>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleFullyLiquidatedPartyA(event: FullyLiquidatedPartyA): void {
	let handler = new FullyLiquidatedPartyAHandler<FullyLiquidatedPartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleFullyLiquidatedPartyB(event: FullyLiquidatedPartyB): void {
	let handler = new FullyLiquidatedPartyBHandler<FullyLiquidatedPartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleInternalTransfer(event: InternalTransfer): void {
	let handler = new InternalTransferHandler<InternalTransfer>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidationDisputed(event: LiquidationDisputed): void {
	let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler<LockQuote>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler<OpenPosition>()
	handler.handle(event, Version.v_0_8_3)
}

export function handlePauseAccounting(event: PauseAccounting): void {
	let handler = new PauseAccountingHandler<PauseAccounting>()
	handler.handle(event, Version.v_0_8_3)
}

export function handlePauseGlobal(event: PauseGlobal): void {
	let handler = new PauseGlobalHandler<PauseGlobal>()
	handler.handle(event, Version.v_0_8_3)
}

export function handlePauseInternalTransfer(event: PauseInternalTransfer): void {
	let handler = new PauseInternalTransferHandler<PauseInternalTransfer>()
	handler.handle(event, Version.v_0_8_3)
}

export function handlePauseLiquidation(event: PauseLiquidation): void {
	let handler = new PauseLiquidationHandler<PauseLiquidation>()
	handler.handle(event, Version.v_0_8_3)
}

export function handlePausePartyAActions(event: PausePartyAActions): void {
	let handler = new PausePartyAActionsHandler<PausePartyAActions>()
	handler.handle(event, Version.v_0_8_3)
}

export function handlePausePartyBActions(event: PausePartyBActions): void {
	let handler = new PausePartyBActionsHandler<PausePartyBActions>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRegisterAffiliate(event: RegisterAffiliate): void {
	let handler = new RegisterAffiliateHandler<RegisterAffiliate>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRegisterPartyB(event: RegisterPartyB): void {
	let handler = new RegisterPartyBHandler<RegisterPartyB>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRemoveBridge(event: RemoveBridge): void {
	let handler = new RemoveBridgeHandler<RemoveBridge>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleResolveLiquidationDispute(event: ResolveLiquidationDispute): void {
	let handler = new ResolveLiquidationDisputeHandler<ResolveLiquidationDispute>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRestoreBridgeTransaction(event: RestoreBridgeTransaction): void {
	let handler = new RestoreBridgeTransactionHandler<RestoreBridgeTransaction>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler<SendQuote>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetBalanceLimitPerUser(event: SetBalanceLimitPerUser): void {
	let handler = new SetBalanceLimitPerUserHandler<SetBalanceLimitPerUser>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetCollateral(event: SetCollateral): void {
	let handler = new SetCollateralHandler<SetCollateral>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetDeallocateCooldown(event: SetDeallocateCooldown): void {
	let handler = new SetDeallocateCooldownHandler<SetDeallocateCooldown>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetDeallocateDebounceTime(event: SetDeallocateDebounceTime): void {
	let handler = new SetDeallocateDebounceTimeHandler<SetDeallocateDebounceTime>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetDefaultFeeCollector(event: SetDefaultFeeCollector): void {
	let handler = new SetDefaultFeeCollectorHandler<SetDefaultFeeCollector>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetFeeCollector(event: SetFeeCollector): void {
	let handler = new SetFeeCollectorHandler<SetFeeCollector>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetForceCancelCloseCooldown(event: SetForceCancelCloseCooldown): void {
	let handler = new SetForceCancelCloseCooldownHandler<SetForceCancelCloseCooldown>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetForceCancelCooldown(event: SetForceCancelCooldown): void {
	let handler = new SetForceCancelCooldownHandler<SetForceCancelCooldown>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetForceCloseCooldowns(event: SetForceCloseCooldowns): void {
	let handler = new SetForceCloseCooldownsHandler<SetForceCloseCooldowns>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetForceCloseGapRatio(event: SetForceCloseGapRatio): void {
	let handler = new SetForceCloseGapRatioHandler<SetForceCloseGapRatio>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetForceCloseMinSigPeriod(event: SetForceCloseMinSigPeriod): void {
	let handler = new SetForceCloseMinSigPeriodHandler<SetForceCloseMinSigPeriod>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetForceClosePricePenalty(event: SetForceClosePricePenalty): void {
	let handler = new SetForceClosePricePenaltyHandler<SetForceClosePricePenalty>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetInvalidBridgedAmountsPool(event: SetInvalidBridgedAmountsPool): void {
	let handler = new SetInvalidBridgedAmountsPoolHandler<SetInvalidBridgedAmountsPool>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetLiquidationTimeout(event: SetLiquidationTimeout): void {
	let handler = new SetLiquidationTimeoutHandler<SetLiquidationTimeout>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetLiquidatorShare(event: SetLiquidatorShare): void {
	let handler = new SetLiquidatorShareHandler<SetLiquidatorShare>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetMuonConfig(event: SetMuonConfig): void {
	let handler = new SetMuonConfigHandler<SetMuonConfig>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetMuonIds(event: SetMuonIds): void {
	let handler = new SetMuonIdsHandler<SetMuonIds>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetPartyBEmergencyStatus(event: SetPartyBEmergencyStatus): void {
	let handler = new SetPartyBEmergencyStatusHandler<SetPartyBEmergencyStatus>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetPendingQuotesValidLength(event: SetPendingQuotesValidLength): void {
	let handler = new SetPendingQuotesValidLengthHandler<SetPendingQuotesValidLength>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSuspendedAddress(event: SetSuspendedAddress): void {
	let handler = new SetSuspendedAddressHandler<SetSuspendedAddress>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolAcceptableValues(event: SetSymbolAcceptableValues): void {
	let handler = new SetSymbolAcceptableValuesHandler<SetSymbolAcceptableValues>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolFundingState(event: SetSymbolFundingState): void {
	let handler = new SetSymbolFundingStateHandler<SetSymbolFundingState>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolMaxLeverage(event: SetSymbolMaxLeverage): void {
	let handler = new SetSymbolMaxLeverageHandler<SetSymbolMaxLeverage>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolMaxSlippage(event: SetSymbolMaxSlippage): void {
	let handler = new SetSymbolMaxSlippageHandler<SetSymbolMaxSlippage>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
	let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
	let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSuspendBridgeTransaction(event: SuspendBridgeTransaction): void {
	let handler = new SuspendBridgeTransactionHandler<SuspendBridgeTransaction>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleTransferAllocation(event: TransferAllocation): void {
	let handler = new TransferAllocationHandler<TransferAllocation>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleTransferToBridge(event: TransferToBridge): void {
	let handler = new TransferToBridgeHandler<TransferToBridge>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler<UnlockQuote>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleUnpauseAccounting(event: UnpauseAccounting): void {
	let handler = new UnpauseAccountingHandler<UnpauseAccounting>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleUnpauseGlobal(event: UnpauseGlobal): void {
	let handler = new UnpauseGlobalHandler<UnpauseGlobal>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleUnpauseInternalTransfer(event: UnpauseInternalTransfer): void {
	let handler = new UnpauseInternalTransferHandler<UnpauseInternalTransfer>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleUnpauseLiquidation(event: UnpauseLiquidation): void {
	let handler = new UnpauseLiquidationHandler<UnpauseLiquidation>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleUnpausePartyAActions(event: UnpausePartyAActions): void {
	let handler = new UnpausePartyAActionsHandler<UnpausePartyAActions>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleUnpausePartyBActions(event: UnpausePartyBActions): void {
	let handler = new UnpausePartyBActionsHandler<UnpausePartyBActions>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleWithdraw(event: Withdraw): void {
	let handler = new WithdrawHandler<Withdraw>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleWithdrawReceivedBridgeValue(event: WithdrawReceivedBridgeValue): void {
	let handler = new WithdrawReceivedBridgeValueHandler<WithdrawReceivedBridgeValue>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleWithdrawReceivedBridgeValues(event: WithdrawReceivedBridgeValues): void {
	let handler = new WithdrawReceivedBridgeValuesHandler<WithdrawReceivedBridgeValues>()
	handler.handle(event, Version.v_0_8_3)
}
