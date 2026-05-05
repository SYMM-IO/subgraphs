import {AcceptCancelCloseRequestHandler} from './handlers/symmio/AcceptCancelCloseRequestHandler'
import {AcceptCancelCloseRequest} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {AcceptCancelRequestHandler} from './handlers/symmio/AcceptCancelRequestHandler'
import {AcceptCancelRequest} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {ActiveEmergencyModeHandler} from './handlers/symmio/ActiveEmergencyModeHandler'
import {ActiveEmergencyMode} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {AddSymbolHandler} from './handlers/symmio/AddSymbolHandler'
import {AddSymbol} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {AllocateForPartyB} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {AllocatePartyA} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {AllocatePartyBHandler} from './handlers/symmio/AllocatePartyBHandler'
import {AllocatePartyB} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {DeactiveEmergencyModeHandler} from './handlers/symmio/DeactiveEmergencyModeHandler'
import {DeactiveEmergencyMode} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocateForPartyB} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {DeallocatePartyA} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {DepositHandler} from './handlers/symmio/DepositHandler'
import {Deposit} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {DiamondCutHandler} from './handlers/symmio/DiamondCutHandler'
import {DiamondCut} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {EmergencyClosePositionHandler} from './handlers/symmio/EmergencyClosePositionHandler'
import {EmergencyClosePosition} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {ExpireQuoteHandler} from './handlers/symmio/ExpireQuoteHandler'
import {ExpireQuote} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {ForceCancelCloseRequestHandler} from './handlers/symmio/ForceCancelCloseRequestHandler'
import {ForceCancelCloseRequest} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {ForceCancelQuoteHandler} from './handlers/symmio/ForceCancelQuoteHandler'
import {ForceCancelQuote} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {ForceClosePositionHandler} from './handlers/symmio/ForceClosePositionHandler'
import {ForceClosePosition} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {LockQuoteHandler} from './handlers/symmio/LockQuoteHandler'
import {LockQuote} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {PauseAccountingHandler} from './handlers/symmio/PauseAccountingHandler'
import {PauseAccounting} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {PauseGlobalHandler} from './handlers/symmio/PauseGlobalHandler'
import {PauseGlobal} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {PauseLiquidationHandler} from './handlers/symmio/PauseLiquidationHandler'
import {PauseLiquidation} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {PausePartyAActionsHandler} from './handlers/symmio/PausePartyAActionsHandler'
import {PausePartyAActions} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {PausePartyBActionsHandler} from './handlers/symmio/PausePartyBActionsHandler'
import {PausePartyBActions} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {RegisterPartyBHandler} from './handlers/symmio/RegisterPartyBHandler'
import {RegisterPartyB} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {RequestToCancelCloseRequestHandler} from './handlers/symmio/RequestToCancelCloseRequestHandler'
import {RequestToCancelCloseRequest} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {RequestToCancelQuoteHandler} from './handlers/symmio/RequestToCancelQuoteHandler'
import {RequestToCancelQuote} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {RequestToClosePositionHandler} from './handlers/symmio/RequestToClosePositionHandler'
import {RequestToClosePosition} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {RoleGrantedHandler} from './handlers/symmio/RoleGrantedHandler'
import {RoleGranted} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {RoleRevokedHandler} from './handlers/symmio/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetBalanceLimitPerUserHandler} from './handlers/symmio/SetBalanceLimitPerUserHandler'
import {SetBalanceLimitPerUser} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetCollateralHandler} from './handlers/symmio/SetCollateralHandler'
import {SetCollateral} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetDeallocateCooldownHandler} from './handlers/symmio/SetDeallocateCooldownHandler'
import {SetDeallocateCooldown} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetFeeCollectorHandler} from './handlers/symmio/SetFeeCollectorHandler'
import {SetFeeCollector} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetForceCancelCloseCooldownHandler} from './handlers/symmio/SetForceCancelCloseCooldownHandler'
import {SetForceCancelCloseCooldown} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetForceCancelCooldownHandler} from './handlers/symmio/SetForceCancelCooldownHandler'
import {SetForceCancelCooldown} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetForceCloseCooldownHandler} from './handlers/symmio/SetForceCloseCooldownHandler'
import {SetForceCloseCooldown} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetForceCloseGapRatioHandler} from './handlers/symmio/SetForceCloseGapRatioHandler'
import {SetForceCloseGapRatio} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetLiquidationTimeoutHandler} from './handlers/symmio/SetLiquidationTimeoutHandler'
import {SetLiquidationTimeout} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetLiquidatorShareHandler} from './handlers/symmio/SetLiquidatorShareHandler'
import {SetLiquidatorShare} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetMuonConfigHandler} from './handlers/symmio/SetMuonConfigHandler'
import {SetMuonConfig} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetMuonIdsHandler} from './handlers/symmio/SetMuonIdsHandler'
import {SetMuonIds} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetPartyBEmergencyStatusHandler} from './handlers/symmio/SetPartyBEmergencyStatusHandler'
import {SetPartyBEmergencyStatus} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetPendingQuotesValidLengthHandler} from './handlers/symmio/SetPendingQuotesValidLengthHandler'
import {SetPendingQuotesValidLength} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetSuspendedAddressHandler} from './handlers/symmio/SetSuspendedAddressHandler'
import {SetSuspendedAddress} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetSymbolAcceptableValuesHandler} from './handlers/symmio/SetSymbolAcceptableValuesHandler'
import {SetSymbolAcceptableValues} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetSymbolMaxSlippageHandler} from './handlers/symmio/SetSymbolMaxSlippageHandler'
import {SetSymbolMaxSlippage} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetSymbolTradingFeeHandler} from './handlers/symmio/SetSymbolTradingFeeHandler'
import {SetSymbolTradingFee} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {SetSymbolValidationStateHandler} from './handlers/symmio/SetSymbolValidationStateHandler'
import {SetSymbolValidationState} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {TransferAllocationHandler} from './handlers/symmio/TransferAllocationHandler'
import {TransferAllocation} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {UnlockQuoteHandler} from './handlers/symmio/UnlockQuoteHandler'
import {UnlockQuote} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {UnpauseAccountingHandler} from './handlers/symmio/UnpauseAccountingHandler'
import {UnpauseAccounting} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {UnpauseGlobalHandler} from './handlers/symmio/UnpauseGlobalHandler'
import {UnpauseGlobal} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {UnpauseLiquidationHandler} from './handlers/symmio/UnpauseLiquidationHandler'
import {UnpauseLiquidation} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {UnpausePartyAActionsHandler} from './handlers/symmio/UnpausePartyAActionsHandler'
import {UnpausePartyAActions} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {UnpausePartyBActionsHandler} from './handlers/symmio/UnpausePartyBActionsHandler'
import {UnpausePartyBActions} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {Version} from '../common/BaseHandler'
import {WithdrawHandler} from './handlers/symmio/WithdrawHandler'
import {Withdraw} from '../../generated/symmio_0_8_0/symmio_0_8_0'
import {ensureSyncMeta} from './src_sync_meta'


export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
    ensureSyncMeta(event.block)
    let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleActiveEmergencyMode(event: ActiveEmergencyMode): void {
    ensureSyncMeta(event.block)
    let handler = new ActiveEmergencyModeHandler<ActiveEmergencyMode>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleAddSymbol(event: AddSymbol): void {
    ensureSyncMeta(event.block)
    let handler = new AddSymbolHandler<AddSymbol>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleAllocateForPartyB(event: AllocateForPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleAllocatePartyA(event: AllocatePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new AllocatePartyAHandler<AllocatePartyA>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleAllocatePartyB(event: AllocatePartyB): void {
    ensureSyncMeta(event.block)
    let handler = new AllocatePartyBHandler<AllocatePartyB>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleDeactiveEmergencyMode(event: DeactiveEmergencyMode): void {
    ensureSyncMeta(event.block)
    let handler = new DeactiveEmergencyModeHandler<DeactiveEmergencyMode>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleDeallocatePartyA(event: DeallocatePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleDeposit(event: Deposit): void {
    ensureSyncMeta(event.block)
    let handler = new DepositHandler<Deposit>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleDiamondCut(event: DiamondCut): void {
    ensureSyncMeta(event.block)
    let handler = new DiamondCutHandler<DiamondCut>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
    ensureSyncMeta(event.block)
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleExpireQuote(event: ExpireQuote): void {
    ensureSyncMeta(event.block)
    let handler = new ExpireQuoteHandler<ExpireQuote>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleFillCloseRequest(event: FillCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new FillCloseRequestHandler<FillCloseRequest>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleForceCancelQuote(event: ForceCancelQuote): void {
    ensureSyncMeta(event.block)
    let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleForceClosePosition(event: ForceClosePosition): void {
    ensureSyncMeta(event.block)
    let handler = new ForceClosePositionHandler<ForceClosePosition>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleLiquidatePartyA(event: LiquidatePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleLockQuote(event: LockQuote): void {
    ensureSyncMeta(event.block)
    let handler = new LockQuoteHandler<LockQuote>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleOpenPosition(event: OpenPosition): void {
    ensureSyncMeta(event.block)
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_0)
}


export function handlePauseAccounting(event: PauseAccounting): void {
    ensureSyncMeta(event.block)
    let handler = new PauseAccountingHandler<PauseAccounting>()
    handler.handle(event, Version.v_0_8_0)
}


export function handlePauseGlobal(event: PauseGlobal): void {
    ensureSyncMeta(event.block)
    let handler = new PauseGlobalHandler<PauseGlobal>()
    handler.handle(event, Version.v_0_8_0)
}


export function handlePauseLiquidation(event: PauseLiquidation): void {
    ensureSyncMeta(event.block)
    let handler = new PauseLiquidationHandler<PauseLiquidation>()
    handler.handle(event, Version.v_0_8_0)
}


export function handlePausePartyAActions(event: PausePartyAActions): void {
    ensureSyncMeta(event.block)
    let handler = new PausePartyAActionsHandler<PausePartyAActions>()
    handler.handle(event, Version.v_0_8_0)
}


export function handlePausePartyBActions(event: PausePartyBActions): void {
    ensureSyncMeta(event.block)
    let handler = new PausePartyBActionsHandler<PausePartyBActions>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleRegisterPartyB(event: RegisterPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new RegisterPartyBHandler<RegisterPartyB>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
    ensureSyncMeta(event.block)
    let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleRequestToClosePosition(event: RequestToClosePosition): void {
    ensureSyncMeta(event.block)
    let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleRoleGranted(event: RoleGranted): void {
    ensureSyncMeta(event.block)
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    ensureSyncMeta(event.block)
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSendQuote(event: SendQuote): void {
    ensureSyncMeta(event.block)
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetBalanceLimitPerUser(event: SetBalanceLimitPerUser): void {
    ensureSyncMeta(event.block)
    let handler = new SetBalanceLimitPerUserHandler<SetBalanceLimitPerUser>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetCollateral(event: SetCollateral): void {
    ensureSyncMeta(event.block)
    let handler = new SetCollateralHandler<SetCollateral>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetDeallocateCooldown(event: SetDeallocateCooldown): void {
    ensureSyncMeta(event.block)
    let handler = new SetDeallocateCooldownHandler<SetDeallocateCooldown>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetFeeCollector(event: SetFeeCollector): void {
    ensureSyncMeta(event.block)
    let handler = new SetFeeCollectorHandler<SetFeeCollector>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetForceCancelCloseCooldown(event: SetForceCancelCloseCooldown): void {
    ensureSyncMeta(event.block)
    let handler = new SetForceCancelCloseCooldownHandler<SetForceCancelCloseCooldown>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetForceCancelCooldown(event: SetForceCancelCooldown): void {
    ensureSyncMeta(event.block)
    let handler = new SetForceCancelCooldownHandler<SetForceCancelCooldown>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetForceCloseCooldown(event: SetForceCloseCooldown): void {
    ensureSyncMeta(event.block)
    let handler = new SetForceCloseCooldownHandler<SetForceCloseCooldown>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetForceCloseGapRatio(event: SetForceCloseGapRatio): void {
    ensureSyncMeta(event.block)
    let handler = new SetForceCloseGapRatioHandler<SetForceCloseGapRatio>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetLiquidationTimeout(event: SetLiquidationTimeout): void {
    ensureSyncMeta(event.block)
    let handler = new SetLiquidationTimeoutHandler<SetLiquidationTimeout>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetLiquidatorShare(event: SetLiquidatorShare): void {
    ensureSyncMeta(event.block)
    let handler = new SetLiquidatorShareHandler<SetLiquidatorShare>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetMuonConfig(event: SetMuonConfig): void {
    ensureSyncMeta(event.block)
    let handler = new SetMuonConfigHandler<SetMuonConfig>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetMuonIds(event: SetMuonIds): void {
    ensureSyncMeta(event.block)
    let handler = new SetMuonIdsHandler<SetMuonIds>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetPartyBEmergencyStatus(event: SetPartyBEmergencyStatus): void {
    ensureSyncMeta(event.block)
    let handler = new SetPartyBEmergencyStatusHandler<SetPartyBEmergencyStatus>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetPendingQuotesValidLength(event: SetPendingQuotesValidLength): void {
    ensureSyncMeta(event.block)
    let handler = new SetPendingQuotesValidLengthHandler<SetPendingQuotesValidLength>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetSuspendedAddress(event: SetSuspendedAddress): void {
    ensureSyncMeta(event.block)
    let handler = new SetSuspendedAddressHandler<SetSuspendedAddress>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetSymbolAcceptableValues(event: SetSymbolAcceptableValues): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolAcceptableValuesHandler<SetSymbolAcceptableValues>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetSymbolMaxSlippage(event: SetSymbolMaxSlippage): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolMaxSlippageHandler<SetSymbolMaxSlippage>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleTransferAllocation(event: TransferAllocation): void {
    ensureSyncMeta(event.block)
    let handler = new TransferAllocationHandler<TransferAllocation>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleUnlockQuote(event: UnlockQuote): void {
    ensureSyncMeta(event.block)
    let handler = new UnlockQuoteHandler<UnlockQuote>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleUnpauseAccounting(event: UnpauseAccounting): void {
    ensureSyncMeta(event.block)
    let handler = new UnpauseAccountingHandler<UnpauseAccounting>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleUnpauseGlobal(event: UnpauseGlobal): void {
    ensureSyncMeta(event.block)
    let handler = new UnpauseGlobalHandler<UnpauseGlobal>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleUnpauseLiquidation(event: UnpauseLiquidation): void {
    ensureSyncMeta(event.block)
    let handler = new UnpauseLiquidationHandler<UnpauseLiquidation>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleUnpausePartyAActions(event: UnpausePartyAActions): void {
    ensureSyncMeta(event.block)
    let handler = new UnpausePartyAActionsHandler<UnpausePartyAActions>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleUnpausePartyBActions(event: UnpausePartyBActions): void {
    ensureSyncMeta(event.block)
    let handler = new UnpausePartyBActionsHandler<UnpausePartyBActions>()
    handler.handle(event, Version.v_0_8_0)
}


export function handleWithdraw(event: Withdraw): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawHandler<Withdraw>()
    handler.handle(event, Version.v_0_8_0)
}
