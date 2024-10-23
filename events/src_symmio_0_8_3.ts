import {AcceptCancelCloseRequestHandler} from './handlers/symmio/AcceptCancelCloseRequestHandler'
import {AcceptCancelCloseRequest} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {AcceptCancelRequestHandler} from './handlers/symmio/AcceptCancelRequestHandler'
import {AcceptCancelRequest} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {ActiveEmergencyModeHandler} from './handlers/symmio/ActiveEmergencyModeHandler'
import {ActiveEmergencyMode} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {AddSymbolHandler} from './handlers/symmio/AddSymbolHandler'
import {AddSymbol} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {AllocateForPartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {AllocatePartyA} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {AllocatePartyBHandler} from './handlers/symmio/AllocatePartyBHandler'
import {AllocatePartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {ChargeFundingRateHandler} from './handlers/symmio/ChargeFundingRateHandler'
import {ChargeFundingRate} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {DeactiveEmergencyModeHandler} from './handlers/symmio/DeactiveEmergencyModeHandler'
import {DeactiveEmergencyMode} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocateForPartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {DeallocatePartyA} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {DepositHandler} from './handlers/symmio/DepositHandler'
import {Deposit} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {DeregisterPartyBHandler} from './handlers/symmio/DeregisterPartyBHandler'
import {DeregisterPartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {DisputeForLiquidationHandler} from './handlers/symmio/DisputeForLiquidationHandler'
import {DisputeForLiquidation} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {EmergencyClosePositionHandler} from './handlers/symmio/EmergencyClosePositionHandler'
import {EmergencyClosePosition} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {ExpireQuoteHandler} from './handlers/symmio/ExpireQuoteHandler'
import {ExpireQuote} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {ForceCancelCloseRequestHandler} from './handlers/symmio/ForceCancelCloseRequestHandler'
import {ForceCancelCloseRequest} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {ForceCancelQuoteHandler} from './handlers/symmio/ForceCancelQuoteHandler'
import {ForceCancelQuote} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {ForceClosePositionHandler} from './handlers/symmio/ForceClosePositionHandler'
import {ForceClosePosition} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {FullyLiquidatedPartyBHandler} from './handlers/symmio/FullyLiquidatedPartyBHandler'
import {FullyLiquidatedPartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidatePartyA1} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidatePendingPositionsPartyA1} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidatePendingPositionsPartyAHandler} from './handlers/symmio/LiquidatePendingPositionsPartyAHandler'
import {LiquidatePendingPositionsPartyA} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidationDisputed1} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LiquidationDisputedHandler} from './handlers/symmio/LiquidationDisputedHandler'
import {LiquidationDisputed} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {LockQuoteHandler} from './handlers/symmio/LockQuoteHandler'
import {LockQuote} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {PauseAccountingHandler} from './handlers/symmio/PauseAccountingHandler'
import {PauseAccounting} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {PauseGlobalHandler} from './handlers/symmio/PauseGlobalHandler'
import {PauseGlobal} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {PauseLiquidationHandler} from './handlers/symmio/PauseLiquidationHandler'
import {PauseLiquidation} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {PausePartyAActionsHandler} from './handlers/symmio/PausePartyAActionsHandler'
import {PausePartyAActions} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {PausePartyBActionsHandler} from './handlers/symmio/PausePartyBActionsHandler'
import {PausePartyBActions} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {RegisterPartyBHandler} from './handlers/symmio/RegisterPartyBHandler'
import {RegisterPartyB} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {RequestToCancelCloseRequestHandler} from './handlers/symmio/RequestToCancelCloseRequestHandler'
import {RequestToCancelCloseRequest} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {RequestToCancelQuoteHandler} from './handlers/symmio/RequestToCancelQuoteHandler'
import {RequestToCancelQuote} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {RequestToClosePositionHandler} from './handlers/symmio/RequestToClosePositionHandler'
import {RequestToClosePosition} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {RoleGrantedHandler} from './handlers/symmio/RoleGrantedHandler'
import {RoleGranted} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {RoleRevokedHandler} from './handlers/symmio/RoleRevokedHandler'
import {RoleRevoked} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetBalanceLimitPerUserHandler} from './handlers/symmio/SetBalanceLimitPerUserHandler'
import {SetBalanceLimitPerUser} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetCollateralHandler} from './handlers/symmio/SetCollateralHandler'
import {SetCollateral} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetDeallocateCooldownHandler} from './handlers/symmio/SetDeallocateCooldownHandler'
import {SetDeallocateCooldown} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetFeeCollectorHandler} from './handlers/symmio/SetFeeCollectorHandler'
import {SetFeeCollector} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetForceCancelCloseCooldownHandler} from './handlers/symmio/SetForceCancelCloseCooldownHandler'
import {SetForceCancelCloseCooldown} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetForceCancelCooldownHandler} from './handlers/symmio/SetForceCancelCooldownHandler'
import {SetForceCancelCooldown} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetForceCloseGapRatioHandler} from './handlers/symmio/SetForceCloseGapRatioHandler'
import {SetForceCloseGapRatio} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetLiquidationTimeoutHandler} from './handlers/symmio/SetLiquidationTimeoutHandler'
import {SetLiquidationTimeout} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetLiquidatorShareHandler} from './handlers/symmio/SetLiquidatorShareHandler'
import {SetLiquidatorShare} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetMuonConfigHandler} from './handlers/symmio/SetMuonConfigHandler'
import {SetMuonConfig} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetMuonIdsHandler} from './handlers/symmio/SetMuonIdsHandler'
import {SetMuonIds} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetPartyBEmergencyStatusHandler} from './handlers/symmio/SetPartyBEmergencyStatusHandler'
import {SetPartyBEmergencyStatus} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetPendingQuotesValidLengthHandler} from './handlers/symmio/SetPendingQuotesValidLengthHandler'
import {SetPendingQuotesValidLength} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSuspendedAddressHandler} from './handlers/symmio/SetSuspendedAddressHandler'
import {SetSuspendedAddress} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolAcceptableValuesHandler} from './handlers/symmio/SetSymbolAcceptableValuesHandler'
import {SetSymbolAcceptableValues} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolFundingStateHandler} from './handlers/symmio/SetSymbolFundingStateHandler'
import {SetSymbolFundingState} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolMaxLeverageHandler} from './handlers/symmio/SetSymbolMaxLeverageHandler'
import {SetSymbolMaxLeverage} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolMaxSlippageHandler} from './handlers/symmio/SetSymbolMaxSlippageHandler'
import {SetSymbolMaxSlippage} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolTradingFeeHandler} from './handlers/symmio/SetSymbolTradingFeeHandler'
import {SetSymbolTradingFee} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolValidationStateHandler} from './handlers/symmio/SetSymbolValidationStateHandler'
import {SetSymbolValidationState} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolsPrices1} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SetSymbolsPrices} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SettlePartyALiquidation1} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {SettlePartyALiquidation} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {TransferAllocation1} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {TransferAllocationHandler} from './handlers/symmio/TransferAllocationHandler'
import {TransferAllocation} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {UnlockQuoteHandler} from './handlers/symmio/UnlockQuoteHandler'
import {UnlockQuote} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {UnpauseAccountingHandler} from './handlers/symmio/UnpauseAccountingHandler'
import {UnpauseAccounting} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {UnpauseGlobalHandler} from './handlers/symmio/UnpauseGlobalHandler'
import {UnpauseGlobal} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {UnpauseLiquidationHandler} from './handlers/symmio/UnpauseLiquidationHandler'
import {UnpauseLiquidation} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {UnpausePartyAActionsHandler} from './handlers/symmio/UnpausePartyAActionsHandler'
import {UnpausePartyAActions} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {UnpausePartyBActionsHandler} from './handlers/symmio/UnpausePartyBActionsHandler'
import {UnpausePartyBActions} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {Version} from '../common/BaseHandler'
import {WithdrawHandler} from './handlers/symmio/WithdrawHandler'
import {Withdraw} from '../generated/symmio_0_8_3/symmio_0_8_3'


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


export function handleDeposit(event: Deposit): void {
    let handler = new DepositHandler<Deposit>()
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


export function handleExpireQuote(event: ExpireQuote): void {
    let handler = new ExpireQuoteHandler<ExpireQuote>()
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


export function handleFullyLiquidatedPartyB(event: FullyLiquidatedPartyB): void {
    let handler = new FullyLiquidatedPartyBHandler<FullyLiquidatedPartyB>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleLiquidatePartyA(event: LiquidatePartyA): void {
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleLiquidatePartyA1(event: LiquidatePartyA1): void {
    let handler = new LiquidatePartyAHandler<LiquidatePartyA1>()
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


export function handleLiquidatePendingPositionsPartyA1(event: LiquidatePendingPositionsPartyA1): void {
    let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA1>()
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


export function handleLiquidationDisputed1(event: LiquidationDisputed1): void {
    let handler = new LiquidationDisputedHandler<LiquidationDisputed1>()
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


export function handleRegisterPartyB(event: RegisterPartyB): void {
    let handler = new RegisterPartyBHandler<RegisterPartyB>()
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


export function handleSetForceCloseGapRatio(event: SetForceCloseGapRatio): void {
    let handler = new SetForceCloseGapRatioHandler<SetForceCloseGapRatio>()
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


export function handleSetSymbolsPrices1(event: SetSymbolsPrices1): void {
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices1>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleSettlePartyALiquidation1(event: SettlePartyALiquidation1): void {
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation1>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleTransferAllocation(event: TransferAllocation): void {
    let handler = new TransferAllocationHandler<TransferAllocation>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleTransferAllocation1(event: TransferAllocation1): void {
    let handler = new TransferAllocationHandler<TransferAllocation1>()
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
