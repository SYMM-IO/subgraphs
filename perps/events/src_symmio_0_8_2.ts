import { AcceptCancelCloseRequestHandler } from "./handlers/symmio/AcceptCancelCloseRequestHandler"
import {
import {ensureSyncMeta} from './src_sync_meta'
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
	DeregisterPartyB,
	DisputeForLiquidation,
	EmergencyClosePosition,
	ExpireQuote,
	FillCloseRequest,
	ForceCancelCloseRequest,
	ForceCancelQuote,
	ForceClosePosition,
	FullyLiquidatedPartyB,
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
	PauseLiquidation,
	PausePartyAActions,
	PausePartyBActions,
	RegisterPartyB,
	RequestToCancelCloseRequest,
	RequestToCancelQuote,
	RequestToClosePosition,
	RoleGranted,
	RoleRevoked,
	SendQuote,
	SetBalanceLimitPerUser,
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
	SetSymbolFundingState,
	SetSymbolMaxLeverage,
	SetSymbolMaxSlippage,
	SetSymbolsPrices,
	SetSymbolTradingFee,
	SetSymbolValidationState,
	SettlePartyALiquidation,
	TransferAllocation,
	UnlockQuote,
	UnpauseAccounting,
	UnpauseGlobal,
	UnpauseLiquidation,
	UnpausePartyAActions,
	UnpausePartyBActions,
	Withdraw,
	DiamondCut,
} from "../../generated/symmio_0_8_2/symmio_0_8_2"
import { AcceptCancelRequestHandler } from "./handlers/symmio/AcceptCancelRequestHandler"
import { ActiveEmergencyModeHandler } from "./handlers/symmio/ActiveEmergencyModeHandler"
import { AddSymbolHandler } from "./handlers/symmio/AddSymbolHandler"
import { AllocateForPartyBHandler } from "./handlers/symmio/AllocateForPartyBHandler"
import { AllocatePartyAHandler } from "./handlers/symmio/AllocatePartyAHandler"
import { AllocatePartyBHandler } from "./handlers/symmio/AllocatePartyBHandler"
import { ChargeFundingRateHandler } from "./handlers/symmio/ChargeFundingRateHandler"
import { DeactiveEmergencyModeHandler } from "./handlers/symmio/DeactiveEmergencyModeHandler"
import { DeallocateForPartyBHandler } from "./handlers/symmio/DeallocateForPartyBHandler"
import { DeallocatePartyAHandler } from "./handlers/symmio/DeallocatePartyAHandler"
import { DepositHandler } from "./handlers/symmio/DepositHandler"
import { DeregisterPartyBHandler } from "./handlers/symmio/DeregisterPartyBHandler"
import { DisputeForLiquidationHandler } from "./handlers/symmio/DisputeForLiquidationHandler"
import { EmergencyClosePositionHandler } from "./handlers/symmio/EmergencyClosePositionHandler"
import { ExpireQuoteHandler } from "./handlers/symmio/ExpireQuoteHandler"
import { FillCloseRequestHandler } from "./handlers/symmio/FillCloseRequestHandler"
import { ForceCancelCloseRequestHandler } from "./handlers/symmio/ForceCancelCloseRequestHandler"
import { ForceCancelQuoteHandler } from "./handlers/symmio/ForceCancelQuoteHandler"
import { ForceClosePositionHandler } from "./handlers/symmio/ForceClosePositionHandler"
import { FullyLiquidatedPartyBHandler } from "./handlers/symmio/FullyLiquidatedPartyBHandler"
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
import { PauseLiquidationHandler } from "./handlers/symmio/PauseLiquidationHandler"
import { PausePartyAActionsHandler } from "./handlers/symmio/PausePartyAActionsHandler"
import { PausePartyBActionsHandler } from "./handlers/symmio/PausePartyBActionsHandler"
import { RegisterPartyBHandler } from "./handlers/symmio/RegisterPartyBHandler"
import { RequestToCancelCloseRequestHandler } from "./handlers/symmio/RequestToCancelCloseRequestHandler"
import { RequestToCancelQuoteHandler } from "./handlers/symmio/RequestToCancelQuoteHandler"
import { RequestToClosePositionHandler } from "./handlers/symmio/RequestToClosePositionHandler"
import { RoleGrantedHandler } from "./handlers/symmio/RoleGrantedHandler"
import { RoleRevokedHandler } from "./handlers/symmio/RoleRevokedHandler"
import { SendQuoteHandler } from "./handlers/symmio/SendQuoteHandler"
import { SetBalanceLimitPerUserHandler } from "./handlers/symmio/SetBalanceLimitPerUserHandler"
import { SetCollateralHandler } from "./handlers/symmio/SetCollateralHandler"
import { SetDeallocateCooldownHandler } from "./handlers/symmio/SetDeallocateCooldownHandler"
import { SetFeeCollectorHandler } from "./handlers/symmio/SetFeeCollectorHandler"
import { SetForceCancelCloseCooldownHandler } from "./handlers/symmio/SetForceCancelCloseCooldownHandler"
import { SetForceCancelCooldownHandler } from "./handlers/symmio/SetForceCancelCooldownHandler"
import { SetForceCloseCooldownHandler } from "./handlers/symmio/SetForceCloseCooldownHandler"
import { SetForceCloseGapRatioHandler } from "./handlers/symmio/SetForceCloseGapRatioHandler"
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
import { TransferAllocationHandler } from "./handlers/symmio/TransferAllocationHandler"
import { UnlockQuoteHandler } from "./handlers/symmio/UnlockQuoteHandler"
import { UnpauseAccountingHandler } from "./handlers/symmio/UnpauseAccountingHandler"
import { UnpauseGlobalHandler } from "./handlers/symmio/UnpauseGlobalHandler"
import { UnpauseLiquidationHandler } from "./handlers/symmio/UnpauseLiquidationHandler"
import { UnpausePartyAActionsHandler } from "./handlers/symmio/UnpausePartyAActionsHandler"
import { UnpausePartyBActionsHandler } from "./handlers/symmio/UnpausePartyBActionsHandler"
import { Version } from "../common/BaseHandler"
import { WithdrawHandler } from "./handlers/symmio/WithdrawHandler"
import { DiamondCutHandler } from "./handlers/symmio/DiamondCutHandler"

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	ensureSyncMeta(event.block)
	let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	ensureSyncMeta(event.block)
	let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleActiveEmergencyMode(event: ActiveEmergencyMode): void {
	ensureSyncMeta(event.block)
	let handler = new ActiveEmergencyModeHandler<ActiveEmergencyMode>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAddSymbol(event: AddSymbol): void {
	ensureSyncMeta(event.block)
	let handler = new AddSymbolHandler<AddSymbol>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	ensureSyncMeta(event.block)
	let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
	ensureSyncMeta(event.block)
	let handler = new AllocatePartyAHandler<AllocatePartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAllocatePartyB(event: AllocatePartyB): void {
	ensureSyncMeta(event.block)
	let handler = new AllocatePartyBHandler<AllocatePartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	ensureSyncMeta(event.block)
	let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeactiveEmergencyMode(event: DeactiveEmergencyMode): void {
	ensureSyncMeta(event.block)
	let handler = new DeactiveEmergencyModeHandler<DeactiveEmergencyMode>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	ensureSyncMeta(event.block)
	let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	ensureSyncMeta(event.block)
	let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeposit(event: Deposit): void {
	ensureSyncMeta(event.block)
	let handler = new DepositHandler<Deposit>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeregisterPartyB(event: DeregisterPartyB): void {
	ensureSyncMeta(event.block)
	let handler = new DeregisterPartyBHandler<DeregisterPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDisputeForLiquidation(event: DisputeForLiquidation): void {
	ensureSyncMeta(event.block)
	let handler = new DisputeForLiquidationHandler<DisputeForLiquidation>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	ensureSyncMeta(event.block)
	let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleExpireQuote(event: ExpireQuote): void {
	ensureSyncMeta(event.block)
	let handler = new ExpireQuoteHandler<ExpireQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	ensureSyncMeta(event.block)
	let handler = new FillCloseRequestHandler<FillCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	ensureSyncMeta(event.block)
	let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
	ensureSyncMeta(event.block)
	let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	ensureSyncMeta(event.block)
	let handler = new ForceClosePositionHandler<ForceClosePosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleFullyLiquidatedPartyB(event: FullyLiquidatedPartyB): void {
	ensureSyncMeta(event.block)
	let handler = new FullyLiquidatedPartyBHandler<FullyLiquidatedPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	ensureSyncMeta(event.block)
	let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	ensureSyncMeta(event.block)
	let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	ensureSyncMeta(event.block)
	let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	ensureSyncMeta(event.block)
	let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	ensureSyncMeta(event.block)
	let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidationDisputed(event: LiquidationDisputed): void {
	ensureSyncMeta(event.block)
	let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLockQuote(event: LockQuote): void {
	ensureSyncMeta(event.block)
	let handler = new LockQuoteHandler<LockQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleOpenPosition(event: OpenPosition): void {
	ensureSyncMeta(event.block)
	let handler = new OpenPositionHandler<OpenPosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handlePauseAccounting(event: PauseAccounting): void {
	ensureSyncMeta(event.block)
	let handler = new PauseAccountingHandler<PauseAccounting>()
	handler.handle(event, Version.v_0_8_2)
}

export function handlePauseGlobal(event: PauseGlobal): void {
	ensureSyncMeta(event.block)
	let handler = new PauseGlobalHandler<PauseGlobal>()
	handler.handle(event, Version.v_0_8_2)
}

export function handlePauseLiquidation(event: PauseLiquidation): void {
	ensureSyncMeta(event.block)
	let handler = new PauseLiquidationHandler<PauseLiquidation>()
	handler.handle(event, Version.v_0_8_2)
}

export function handlePausePartyAActions(event: PausePartyAActions): void {
	ensureSyncMeta(event.block)
	let handler = new PausePartyAActionsHandler<PausePartyAActions>()
	handler.handle(event, Version.v_0_8_2)
}

export function handlePausePartyBActions(event: PausePartyBActions): void {
	ensureSyncMeta(event.block)
	let handler = new PausePartyBActionsHandler<PausePartyBActions>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRegisterPartyB(event: RegisterPartyB): void {
	ensureSyncMeta(event.block)
	let handler = new RegisterPartyBHandler<RegisterPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	ensureSyncMeta(event.block)
	let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	ensureSyncMeta(event.block)
	let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	ensureSyncMeta(event.block)
	let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRoleGranted(event: RoleGranted): void {
	ensureSyncMeta(event.block)
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	ensureSyncMeta(event.block)
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSendQuote(event: SendQuote): void {
	ensureSyncMeta(event.block)
	let handler = new SendQuoteHandler<SendQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetBalanceLimitPerUser(event: SetBalanceLimitPerUser): void {
	ensureSyncMeta(event.block)
	let handler = new SetBalanceLimitPerUserHandler<SetBalanceLimitPerUser>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetCollateral(event: SetCollateral): void {
	ensureSyncMeta(event.block)
	let handler = new SetCollateralHandler<SetCollateral>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetDeallocateCooldown(event: SetDeallocateCooldown): void {
	ensureSyncMeta(event.block)
	let handler = new SetDeallocateCooldownHandler<SetDeallocateCooldown>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetFeeCollector(event: SetFeeCollector): void {
	ensureSyncMeta(event.block)
	let handler = new SetFeeCollectorHandler<SetFeeCollector>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetForceCancelCloseCooldown(event: SetForceCancelCloseCooldown): void {
	ensureSyncMeta(event.block)
	let handler = new SetForceCancelCloseCooldownHandler<SetForceCancelCloseCooldown>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetForceCancelCooldown(event: SetForceCancelCooldown): void {
	ensureSyncMeta(event.block)
	let handler = new SetForceCancelCooldownHandler<SetForceCancelCooldown>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetForceCloseCooldown(event: SetForceCloseCooldown): void {
	ensureSyncMeta(event.block)
	let handler = new SetForceCloseCooldownHandler<SetForceCloseCooldown>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetForceCloseGapRatio(event: SetForceCloseGapRatio): void {
	ensureSyncMeta(event.block)
	let handler = new SetForceCloseGapRatioHandler<SetForceCloseGapRatio>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetLiquidationTimeout(event: SetLiquidationTimeout): void {
	ensureSyncMeta(event.block)
	let handler = new SetLiquidationTimeoutHandler<SetLiquidationTimeout>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetLiquidatorShare(event: SetLiquidatorShare): void {
	ensureSyncMeta(event.block)
	let handler = new SetLiquidatorShareHandler<SetLiquidatorShare>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetMuonConfig(event: SetMuonConfig): void {
	ensureSyncMeta(event.block)
	let handler = new SetMuonConfigHandler<SetMuonConfig>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetMuonIds(event: SetMuonIds): void {
	ensureSyncMeta(event.block)
	let handler = new SetMuonIdsHandler<SetMuonIds>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetPartyBEmergencyStatus(event: SetPartyBEmergencyStatus): void {
	ensureSyncMeta(event.block)
	let handler = new SetPartyBEmergencyStatusHandler<SetPartyBEmergencyStatus>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetPendingQuotesValidLength(event: SetPendingQuotesValidLength): void {
	ensureSyncMeta(event.block)
	let handler = new SetPendingQuotesValidLengthHandler<SetPendingQuotesValidLength>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSuspendedAddress(event: SetSuspendedAddress): void {
	ensureSyncMeta(event.block)
	let handler = new SetSuspendedAddressHandler<SetSuspendedAddress>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolAcceptableValues(event: SetSymbolAcceptableValues): void {
	ensureSyncMeta(event.block)
	let handler = new SetSymbolAcceptableValuesHandler<SetSymbolAcceptableValues>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolFundingState(event: SetSymbolFundingState): void {
	ensureSyncMeta(event.block)
	let handler = new SetSymbolFundingStateHandler<SetSymbolFundingState>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolMaxLeverage(event: SetSymbolMaxLeverage): void {
	ensureSyncMeta(event.block)
	let handler = new SetSymbolMaxLeverageHandler<SetSymbolMaxLeverage>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolMaxSlippage(event: SetSymbolMaxSlippage): void {
	ensureSyncMeta(event.block)
	let handler = new SetSymbolMaxSlippageHandler<SetSymbolMaxSlippage>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	ensureSyncMeta(event.block)
	let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
	ensureSyncMeta(event.block)
	let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	ensureSyncMeta(event.block)
	let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
	ensureSyncMeta(event.block)
	let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleTransferAllocation(event: TransferAllocation): void {
	ensureSyncMeta(event.block)
	let handler = new TransferAllocationHandler<TransferAllocation>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnlockQuote(event: UnlockQuote): void {
	ensureSyncMeta(event.block)
	let handler = new UnlockQuoteHandler<UnlockQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnpauseAccounting(event: UnpauseAccounting): void {
	ensureSyncMeta(event.block)
	let handler = new UnpauseAccountingHandler<UnpauseAccounting>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnpauseGlobal(event: UnpauseGlobal): void {
	ensureSyncMeta(event.block)
	let handler = new UnpauseGlobalHandler<UnpauseGlobal>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnpauseLiquidation(event: UnpauseLiquidation): void {
	ensureSyncMeta(event.block)
	let handler = new UnpauseLiquidationHandler<UnpauseLiquidation>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnpausePartyAActions(event: UnpausePartyAActions): void {
	ensureSyncMeta(event.block)
	let handler = new UnpausePartyAActionsHandler<UnpausePartyAActions>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnpausePartyBActions(event: UnpausePartyBActions): void {
	ensureSyncMeta(event.block)
	let handler = new UnpausePartyBActionsHandler<UnpausePartyBActions>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleWithdraw(event: Withdraw): void {
	ensureSyncMeta(event.block)
	let handler = new WithdrawHandler<Withdraw>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDiamondCut(event: DiamondCut): void {
	ensureSyncMeta(event.block)
	let handler = new DiamondCutHandler<DiamondCut>()
	handler.handle(event, Version.v_0_8_2)
}
