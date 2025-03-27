import {AcceptCancelCloseIntentHandler} from './handlers/options/AcceptCancelCloseIntentHandler'
import {AcceptCancelCloseIntent} from '../generated/options_1/options_1'
import {AcceptCancelOpenIntentHandler} from './handlers/options/AcceptCancelOpenIntentHandler'
import {AcceptCancelOpenIntent} from '../generated/options_1/options_1'
import {AcceptCancelTransferIntentHandler} from './handlers/options/AcceptCancelTransferIntentHandler'
import {AcceptCancelTransferIntent} from '../generated/options_1/options_1'
import {ActivateInstantActionModeHandler} from './handlers/options/ActivateInstantActionModeHandler'
import {ActivateInstantActionMode} from '../generated/options_1/options_1'
import {AddressSuspendedHandler} from './handlers/options/AddressSuspendedHandler'
import {AddressSuspended} from '../generated/options_1/options_1'
import {AffiliateFeeCollectorUpdatedHandler} from './handlers/options/AffiliateFeeCollectorUpdatedHandler'
import {AffiliateFeeCollectorUpdated} from '../generated/options_1/options_1'
import {AffiliateStatusUpdatedHandler} from './handlers/options/AffiliateStatusUpdatedHandler'
import {AffiliateStatusUpdated} from '../generated/options_1/options_1'
import {BalanceLimitPerUserUpdatedHandler} from './handlers/options/BalanceLimitPerUserUpdatedHandler'
import {BalanceLimitPerUserUpdated} from '../generated/options_1/options_1'
import {BindToPartyBHandler} from './handlers/options/BindToPartyBHandler'
import {BindToPartyB} from '../generated/options_1/options_1'
import {CancelCloseIntentHandler} from './handlers/options/CancelCloseIntentHandler'
import {CancelCloseIntent} from '../generated/options_1/options_1'
import {CancelOpenIntentHandler} from './handlers/options/CancelOpenIntentHandler'
import {CancelOpenIntent} from '../generated/options_1/options_1'
import {CancelTransferIntentHandler} from './handlers/options/CancelTransferIntentHandler'
import {CancelTransferIntent} from '../generated/options_1/options_1'
import {CancelUnbindingFromPartyBHandler} from './handlers/options/CancelUnbindingFromPartyBHandler'
import {CancelUnbindingFromPartyB} from '../generated/options_1/options_1'
import {CancelWithdrawHandler} from './handlers/options/CancelWithdrawHandler'
import {CancelWithdraw} from '../generated/options_1/options_1'
import {CloseTradesForLiquidationHandler} from './handlers/options/CloseTradesForLiquidationHandler'
import {CloseTradesForLiquidation} from '../generated/options_1/options_1'
import {CollateralRemovedFromWhitelistHandler} from './handlers/options/CollateralRemovedFromWhitelistHandler'
import {CollateralRemovedFromWhitelist} from '../generated/options_1/options_1'
import {CollateralWhitelistedHandler} from './handlers/options/CollateralWhitelistedHandler'
import {CollateralWhitelisted} from '../generated/options_1/options_1'
import {CompleteUnbindingFromPartyBHandler} from './handlers/options/CompleteUnbindingFromPartyBHandler'
import {CompleteUnbindingFromPartyB} from '../generated/options_1/options_1'
import {CompleteWithdrawHandler} from './handlers/options/CompleteWithdrawHandler'
import {CompleteWithdraw} from '../generated/options_1/options_1'
import {ConfiscatePartyAHandler} from './handlers/options/ConfiscatePartyAHandler'
import {ConfiscatePartyA} from '../generated/options_1/options_1'
import {ConfiscatePartyBWithdrawalHandler} from './handlers/options/ConfiscatePartyBWithdrawalHandler'
import {ConfiscatePartyBWithdrawal} from '../generated/options_1/options_1'
import {DeactivateInstantActionModeHandler} from './handlers/options/DeactivateInstantActionModeHandler'
import {DeactivateInstantActionMode} from '../generated/options_1/options_1'
import {DeactiveInstantActionModeCooldownUpdatedHandler} from './handlers/options/DeactiveInstantActionModeCooldownUpdatedHandler'
import {DeactiveInstantActionModeCooldownUpdated} from '../generated/options_1/options_1'
import {DefaultFeeCollectorUpdatedHandler} from './handlers/options/DefaultFeeCollectorUpdatedHandler'
import {DefaultFeeCollectorUpdated} from '../generated/options_1/options_1'
import {DepositHandler} from './handlers/options/DepositHandler'
import {DepositPausedHandler} from './handlers/options/DepositPausedHandler'
import {DepositPaused} from '../generated/options_1/options_1'
import {DepositUnpausedHandler} from './handlers/options/DepositUnpausedHandler'
import {DepositUnpaused} from '../generated/options_1/options_1'
import {Deposit} from '../generated/options_1/options_1'
import {DistributeCollateralHandler} from './handlers/options/DistributeCollateralHandler'
import {DistributeCollateral} from '../generated/options_1/options_1'
import {EmergencyModeActivatedHandler} from './handlers/options/EmergencyModeActivatedHandler'
import {EmergencyModeActivated} from '../generated/options_1/options_1'
import {EmergencyModeDeactivatedHandler} from './handlers/options/EmergencyModeDeactivatedHandler'
import {EmergencyModeDeactivated} from '../generated/options_1/options_1'
import {ExerciseTradeHandler} from './handlers/options/ExerciseTradeHandler'
import {ExerciseTrade} from '../generated/options_1/options_1'
import {ExpireTradeHandler} from './handlers/options/ExpireTradeHandler'
import {ExpireTrade} from '../generated/options_1/options_1'
import {FillCloseIntentHandler} from './handlers/options/FillCloseIntentHandler'
import {FillCloseIntent} from '../generated/options_1/options_1'
import {FillOpenIntentHandler} from './handlers/options/FillOpenIntentHandler'
import {FillOpenIntent} from '../generated/options_1/options_1'
import {FinalizeTransferIntentHandler} from './handlers/options/FinalizeTransferIntentHandler'
import {FinalizeTransferIntent} from '../generated/options_1/options_1'
import {FlagLiquidationHandler} from './handlers/options/FlagLiquidationHandler'
import {FlagLiquidation} from '../generated/options_1/options_1'
import {ForceCancelCloseIntentHandler} from './handlers/options/ForceCancelCloseIntentHandler'
import {ForceCancelCloseIntentTimeoutUpdatedHandler} from './handlers/options/ForceCancelCloseIntentTimeoutUpdatedHandler'
import {ForceCancelCloseIntentTimeoutUpdated} from '../generated/options_1/options_1'
import {ForceCancelCloseIntent} from '../generated/options_1/options_1'
import {ForceCancelOpenIntentHandler} from './handlers/options/ForceCancelOpenIntentHandler'
import {ForceCancelOpenIntentTimeoutUpdatedHandler} from './handlers/options/ForceCancelOpenIntentTimeoutUpdatedHandler'
import {ForceCancelOpenIntentTimeoutUpdated} from '../generated/options_1/options_1'
import {ForceCancelOpenIntent} from '../generated/options_1/options_1'
import {FullyLiquidatedHandler} from './handlers/options/FullyLiquidatedHandler'
import {FullyLiquidated} from '../generated/options_1/options_1'
import {GlobalPausedHandler} from './handlers/options/GlobalPausedHandler'
import {GlobalPaused} from '../generated/options_1/options_1'
import {GlobalUnpausedHandler} from './handlers/options/GlobalUnpausedHandler'
import {GlobalUnpaused} from '../generated/options_1/options_1'
import {InitiateUnbindingFromPartyBHandler} from './handlers/options/InitiateUnbindingFromPartyBHandler'
import {InitiateUnbindingFromPartyB} from '../generated/options_1/options_1'
import {InitiateWithdrawHandler} from './handlers/options/InitiateWithdrawHandler'
import {InitiateWithdraw} from '../generated/options_1/options_1'
import {InstantActionsModeDeactivateTimeUpdatedHandler} from './handlers/options/InstantActionsModeDeactivateTimeUpdatedHandler'
import {InstantActionsModeDeactivateTimeUpdated} from '../generated/options_1/options_1'
import {InstantActionsModeUpdatedHandler} from './handlers/options/InstantActionsModeUpdatedHandler'
import {InstantActionsModeUpdated} from '../generated/options_1/options_1'
import {InternalTransferHandler} from './handlers/options/InternalTransferHandler'
import {InternalTransfer} from '../generated/options_1/options_1'
import {LiquidateHandler} from './handlers/options/LiquidateHandler'
import {Liquidate} from '../generated/options_1/options_1'
import {LiquidatingPausedHandler} from './handlers/options/LiquidatingPausedHandler'
import {LiquidatingPaused} from '../generated/options_1/options_1'
import {LiquidatingUnpausedHandler} from './handlers/options/LiquidatingUnpausedHandler'
import {LiquidatingUnpaused} from '../generated/options_1/options_1'
import {LiquidationDetailUpdatedHandler} from './handlers/options/LiquidationDetailUpdatedHandler'
import {LiquidationDetailUpdated} from '../generated/options_1/options_1'
import {LiquidationSigValidTimeUpdatedHandler} from './handlers/options/LiquidationSigValidTimeUpdatedHandler'
import {LiquidationSigValidTimeUpdated} from '../generated/options_1/options_1'
import {LockOpenIntentHandler} from './handlers/options/LockOpenIntentHandler'
import {LockOpenIntent} from '../generated/options_1/options_1'
import {LockTransferIntentHandler} from './handlers/options/LockTransferIntentHandler'
import {LockTransferIntent} from '../generated/options_1/options_1'
import {MaxCloseOrdersLengthUpdatedHandler} from './handlers/options/MaxCloseOrdersLengthUpdatedHandler'
import {MaxCloseOrdersLengthUpdated} from '../generated/options_1/options_1'
import {MaxConnectedPartyBsUpdatedHandler} from './handlers/options/MaxConnectedPartyBsUpdatedHandler'
import {MaxConnectedPartyBsUpdated} from '../generated/options_1/options_1'
import {MaxTradePerPartyAUpdatedHandler} from './handlers/options/MaxTradePerPartyAUpdatedHandler'
import {MaxTradePerPartyAUpdated} from '../generated/options_1/options_1'
import {OracleAddedHandler} from './handlers/options/OracleAddedHandler'
import {OracleAdded} from '../generated/options_1/options_1'
import {PartyAActionsPausedHandler} from './handlers/options/PartyAActionsPausedHandler'
import {PartyAActionsPaused} from '../generated/options_1/options_1'
import {PartyAActionsUnpausedHandler} from './handlers/options/PartyAActionsUnpausedHandler'
import {PartyAActionsUnpaused} from '../generated/options_1/options_1'
import {PartyADeallocateCooldownUpdatedHandler} from './handlers/options/PartyADeallocateCooldownUpdatedHandler'
import {PartyADeallocateCooldownUpdated} from '../generated/options_1/options_1'
import {PartyBActionsPausedHandler} from './handlers/options/PartyBActionsPausedHandler'
import {PartyBActionsPaused} from '../generated/options_1/options_1'
import {PartyBActionsUnpausedHandler} from './handlers/options/PartyBActionsUnpausedHandler'
import {PartyBActionsUnpaused} from '../generated/options_1/options_1'
import {PartyBConfigUpdatedHandler} from './handlers/options/PartyBConfigUpdatedHandler'
import {PartyBConfigUpdated} from '../generated/options_1/options_1'
import {PartyBDeallocateCooldownUpdatedHandler} from './handlers/options/PartyBDeallocateCooldownUpdatedHandler'
import {PartyBDeallocateCooldownUpdated} from '../generated/options_1/options_1'
import {PartyBEmergencyStatusActivatedHandler} from './handlers/options/PartyBEmergencyStatusActivatedHandler'
import {PartyBEmergencyStatusActivated} from '../generated/options_1/options_1'
import {PartyBEmergencyStatusDeactivatedHandler} from './handlers/options/PartyBEmergencyStatusDeactivatedHandler'
import {PartyBEmergencyStatusDeactivated} from '../generated/options_1/options_1'
import {PartyBReleaseIntervalUpdatedHandler} from './handlers/options/PartyBReleaseIntervalUpdatedHandler'
import {PartyBReleaseIntervalUpdated} from '../generated/options_1/options_1'
import {PriceOracleAddressUpdatedHandler} from './handlers/options/PriceOracleAddressUpdatedHandler'
import {PriceOracleAddressUpdated} from '../generated/options_1/options_1'
import {ProposeToDeactivateInstantActionModeHandler} from './handlers/options/ProposeToDeactivateInstantActionModeHandler'
import {ProposeToDeactivateInstantActionMode} from '../generated/options_1/options_1'
import {RestoreBridgeTransactionHandler} from './handlers/options/RestoreBridgeTransactionHandler'
import {RestoreBridgeTransaction} from '../generated/options_1/options_1'
import {RoleGrantedHandler} from './handlers/options/RoleGrantedHandler'
import {RoleGranted} from '../generated/options_1/options_1'
import {RoleRevokedHandler} from './handlers/options/RoleRevokedHandler'
import {RoleRevoked} from '../generated/options_1/options_1'
import {RoleUpdatedHandler} from './handlers/options/RoleUpdatedHandler'
import {RoleUpdated} from '../generated/options_1/options_1'
import {SendCloseIntentHandler} from './handlers/options/SendCloseIntentHandler'
import {SendCloseIntent} from '../generated/options_1/options_1'
import {SendTransferIntentHandler} from './handlers/options/SendTransferIntentHandler'
import {SendTransferIntent} from '../generated/options_1/options_1'
import {SettlementPriceSigValidTimeUpdatedHandler} from './handlers/options/SettlementPriceSigValidTimeUpdatedHandler'
import {SettlementPriceSigValidTimeUpdated} from '../generated/options_1/options_1'
import {SuspendBridgeTransactionHandler} from './handlers/options/SuspendBridgeTransactionHandler'
import {SuspendBridgeTransaction} from '../generated/options_1/options_1'
import {SymbolAddedHandler} from './handlers/options/SymbolAddedHandler'
import {SymbolAdded} from '../generated/options_1/options_1'
import {SymbolPriceUpdatedHandler} from './handlers/options/SymbolPriceUpdatedHandler'
import {SymbolPriceUpdated} from '../generated/options_1/options_1'
import {SyncBalancesHandler} from './handlers/options/SyncBalancesHandler'
import {SyncBalances} from '../generated/options_1/options_1'
import {TransferToBridgeHandler} from './handlers/options/TransferToBridgeHandler'
import {TransferToBridge} from '../generated/options_1/options_1'
import {TransferTradeByPartyAHandler} from './handlers/options/TransferTradeByPartyAHandler'
import {TransferTradeByPartyA} from '../generated/options_1/options_1'
import {UnbindingCooldownUpdatedHandler} from './handlers/options/UnbindingCooldownUpdatedHandler'
import {UnbindingCooldownUpdated} from '../generated/options_1/options_1'
import {UnflagLiquidationHandler} from './handlers/options/UnflagLiquidationHandler'
import {UnflagLiquidation} from '../generated/options_1/options_1'
import {UnlockOpenIntentHandler} from './handlers/options/UnlockOpenIntentHandler'
import {UnlockOpenIntent} from '../generated/options_1/options_1'
import {UnlockTransferIntentHandler} from './handlers/options/UnlockTransferIntentHandler'
import {UnlockTransferIntent} from '../generated/options_1/options_1'
import {OpVersion} from '../common/BaseHandler'
import {WithdrawPausedHandler} from './handlers/options/WithdrawPausedHandler'
import {WithdrawPaused} from '../generated/options_1/options_1'
import {WithdrawReceivedBridgeValueHandler} from './handlers/options/WithdrawReceivedBridgeValueHandler'
import {WithdrawReceivedBridgeValuesHandler} from './handlers/options/WithdrawReceivedBridgeValuesHandler'
import {WithdrawReceivedBridgeValues} from '../generated/options_1/options_1'
import {WithdrawReceivedBridgeValue} from '../generated/options_1/options_1'
import {WithdrawUnpausedHandler} from './handlers/options/WithdrawUnpausedHandler'
import {WithdrawUnpaused} from '../generated/options_1/options_1'
import {WithdrawalSuspendedHandler} from './handlers/options/WithdrawalSuspendedHandler'
import {WithdrawalSuspended} from '../generated/options_1/options_1'


export function handleAcceptCancelCloseIntent(event: AcceptCancelCloseIntent): void {
    let handler = new AcceptCancelCloseIntentHandler<AcceptCancelCloseIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleAcceptCancelOpenIntent(event: AcceptCancelOpenIntent): void {
    let handler = new AcceptCancelOpenIntentHandler<AcceptCancelOpenIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleAcceptCancelTransferIntent(event: AcceptCancelTransferIntent): void {
    let handler = new AcceptCancelTransferIntentHandler<AcceptCancelTransferIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleActivateInstantActionMode(event: ActivateInstantActionMode): void {
    let handler = new ActivateInstantActionModeHandler<ActivateInstantActionMode>()
    handler.handle(event, OpVersion.v_1)
}


export function handleAddressSuspended(event: AddressSuspended): void {
    let handler = new AddressSuspendedHandler<AddressSuspended>()
    handler.handle(event, OpVersion.v_1)
}


export function handleAffiliateFeeCollectorUpdated(event: AffiliateFeeCollectorUpdated): void {
    let handler = new AffiliateFeeCollectorUpdatedHandler<AffiliateFeeCollectorUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleAffiliateStatusUpdated(event: AffiliateStatusUpdated): void {
    let handler = new AffiliateStatusUpdatedHandler<AffiliateStatusUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleBalanceLimitPerUserUpdated(event: BalanceLimitPerUserUpdated): void {
    let handler = new BalanceLimitPerUserUpdatedHandler<BalanceLimitPerUserUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleBindToPartyB(event: BindToPartyB): void {
    let handler = new BindToPartyBHandler<BindToPartyB>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCancelCloseIntent(event: CancelCloseIntent): void {
    let handler = new CancelCloseIntentHandler<CancelCloseIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCancelOpenIntent(event: CancelOpenIntent): void {
    let handler = new CancelOpenIntentHandler<CancelOpenIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCancelTransferIntent(event: CancelTransferIntent): void {
    let handler = new CancelTransferIntentHandler<CancelTransferIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCancelUnbindingFromPartyB(event: CancelUnbindingFromPartyB): void {
    let handler = new CancelUnbindingFromPartyBHandler<CancelUnbindingFromPartyB>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCancelWithdraw(event: CancelWithdraw): void {
    let handler = new CancelWithdrawHandler<CancelWithdraw>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCloseTradesForLiquidation(event: CloseTradesForLiquidation): void {
    let handler = new CloseTradesForLiquidationHandler<CloseTradesForLiquidation>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCollateralRemovedFromWhitelist(event: CollateralRemovedFromWhitelist): void {
    let handler = new CollateralRemovedFromWhitelistHandler<CollateralRemovedFromWhitelist>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCollateralWhitelisted(event: CollateralWhitelisted): void {
    let handler = new CollateralWhitelistedHandler<CollateralWhitelisted>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCompleteUnbindingFromPartyB(event: CompleteUnbindingFromPartyB): void {
    let handler = new CompleteUnbindingFromPartyBHandler<CompleteUnbindingFromPartyB>()
    handler.handle(event, OpVersion.v_1)
}


export function handleCompleteWithdraw(event: CompleteWithdraw): void {
    let handler = new CompleteWithdrawHandler<CompleteWithdraw>()
    handler.handle(event, OpVersion.v_1)
}


export function handleConfiscatePartyA(event: ConfiscatePartyA): void {
    let handler = new ConfiscatePartyAHandler<ConfiscatePartyA>()
    handler.handle(event, OpVersion.v_1)
}


export function handleConfiscatePartyBWithdrawal(event: ConfiscatePartyBWithdrawal): void {
    let handler = new ConfiscatePartyBWithdrawalHandler<ConfiscatePartyBWithdrawal>()
    handler.handle(event, OpVersion.v_1)
}


export function handleDeactivateInstantActionMode(event: DeactivateInstantActionMode): void {
    let handler = new DeactivateInstantActionModeHandler<DeactivateInstantActionMode>()
    handler.handle(event, OpVersion.v_1)
}


export function handleDeactiveInstantActionModeCooldownUpdated(event: DeactiveInstantActionModeCooldownUpdated): void {
    let handler = new DeactiveInstantActionModeCooldownUpdatedHandler<DeactiveInstantActionModeCooldownUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleDefaultFeeCollectorUpdated(event: DefaultFeeCollectorUpdated): void {
    let handler = new DefaultFeeCollectorUpdatedHandler<DefaultFeeCollectorUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleDeposit(event: Deposit): void {
    let handler = new DepositHandler<Deposit>()
    handler.handle(event, OpVersion.v_1)
}


export function handleDepositPaused(event: DepositPaused): void {
    let handler = new DepositPausedHandler<DepositPaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleDepositUnpaused(event: DepositUnpaused): void {
    let handler = new DepositUnpausedHandler<DepositUnpaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleDistributeCollateral(event: DistributeCollateral): void {
    let handler = new DistributeCollateralHandler<DistributeCollateral>()
    handler.handle(event, OpVersion.v_1)
}


export function handleEmergencyModeActivated(event: EmergencyModeActivated): void {
    let handler = new EmergencyModeActivatedHandler<EmergencyModeActivated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleEmergencyModeDeactivated(event: EmergencyModeDeactivated): void {
    let handler = new EmergencyModeDeactivatedHandler<EmergencyModeDeactivated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleExerciseTrade(event: ExerciseTrade): void {
    let handler = new ExerciseTradeHandler<ExerciseTrade>()
    handler.handle(event, OpVersion.v_1)
}


export function handleExpireTrade(event: ExpireTrade): void {
    let handler = new ExpireTradeHandler<ExpireTrade>()
    handler.handle(event, OpVersion.v_1)
}


export function handleFillCloseIntent(event: FillCloseIntent): void {
    let handler = new FillCloseIntentHandler<FillCloseIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleFillOpenIntent(event: FillOpenIntent): void {
    let handler = new FillOpenIntentHandler<FillOpenIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleFinalizeTransferIntent(event: FinalizeTransferIntent): void {
    let handler = new FinalizeTransferIntentHandler<FinalizeTransferIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleFlagLiquidation(event: FlagLiquidation): void {
    let handler = new FlagLiquidationHandler<FlagLiquidation>()
    handler.handle(event, OpVersion.v_1)
}


export function handleForceCancelCloseIntent(event: ForceCancelCloseIntent): void {
    let handler = new ForceCancelCloseIntentHandler<ForceCancelCloseIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleForceCancelCloseIntentTimeoutUpdated(event: ForceCancelCloseIntentTimeoutUpdated): void {
    let handler = new ForceCancelCloseIntentTimeoutUpdatedHandler<ForceCancelCloseIntentTimeoutUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleForceCancelOpenIntent(event: ForceCancelOpenIntent): void {
    let handler = new ForceCancelOpenIntentHandler<ForceCancelOpenIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleForceCancelOpenIntentTimeoutUpdated(event: ForceCancelOpenIntentTimeoutUpdated): void {
    let handler = new ForceCancelOpenIntentTimeoutUpdatedHandler<ForceCancelOpenIntentTimeoutUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleFullyLiquidated(event: FullyLiquidated): void {
    let handler = new FullyLiquidatedHandler<FullyLiquidated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleGlobalPaused(event: GlobalPaused): void {
    let handler = new GlobalPausedHandler<GlobalPaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleGlobalUnpaused(event: GlobalUnpaused): void {
    let handler = new GlobalUnpausedHandler<GlobalUnpaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleInitiateUnbindingFromPartyB(event: InitiateUnbindingFromPartyB): void {
    let handler = new InitiateUnbindingFromPartyBHandler<InitiateUnbindingFromPartyB>()
    handler.handle(event, OpVersion.v_1)
}


export function handleInitiateWithdraw(event: InitiateWithdraw): void {
    let handler = new InitiateWithdrawHandler<InitiateWithdraw>()
    handler.handle(event, OpVersion.v_1)
}


export function handleInstantActionsModeDeactivateTimeUpdated(event: InstantActionsModeDeactivateTimeUpdated): void {
    let handler = new InstantActionsModeDeactivateTimeUpdatedHandler<InstantActionsModeDeactivateTimeUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleInstantActionsModeUpdated(event: InstantActionsModeUpdated): void {
    let handler = new InstantActionsModeUpdatedHandler<InstantActionsModeUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleInternalTransfer(event: InternalTransfer): void {
    let handler = new InternalTransferHandler<InternalTransfer>()
    handler.handle(event, OpVersion.v_1)
}


export function handleLiquidate(event: Liquidate): void {
    let handler = new LiquidateHandler<Liquidate>()
    handler.handle(event, OpVersion.v_1)
}


export function handleLiquidatingPaused(event: LiquidatingPaused): void {
    let handler = new LiquidatingPausedHandler<LiquidatingPaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleLiquidatingUnpaused(event: LiquidatingUnpaused): void {
    let handler = new LiquidatingUnpausedHandler<LiquidatingUnpaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleLiquidationDetailUpdated(event: LiquidationDetailUpdated): void {
    let handler = new LiquidationDetailUpdatedHandler<LiquidationDetailUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleLiquidationSigValidTimeUpdated(event: LiquidationSigValidTimeUpdated): void {
    let handler = new LiquidationSigValidTimeUpdatedHandler<LiquidationSigValidTimeUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleLockOpenIntent(event: LockOpenIntent): void {
    let handler = new LockOpenIntentHandler<LockOpenIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleLockTransferIntent(event: LockTransferIntent): void {
    let handler = new LockTransferIntentHandler<LockTransferIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleMaxCloseOrdersLengthUpdated(event: MaxCloseOrdersLengthUpdated): void {
    let handler = new MaxCloseOrdersLengthUpdatedHandler<MaxCloseOrdersLengthUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleMaxConnectedPartyBsUpdated(event: MaxConnectedPartyBsUpdated): void {
    let handler = new MaxConnectedPartyBsUpdatedHandler<MaxConnectedPartyBsUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleMaxTradePerPartyAUpdated(event: MaxTradePerPartyAUpdated): void {
    let handler = new MaxTradePerPartyAUpdatedHandler<MaxTradePerPartyAUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleOracleAdded(event: OracleAdded): void {
    let handler = new OracleAddedHandler<OracleAdded>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyAActionsPaused(event: PartyAActionsPaused): void {
    let handler = new PartyAActionsPausedHandler<PartyAActionsPaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyAActionsUnpaused(event: PartyAActionsUnpaused): void {
    let handler = new PartyAActionsUnpausedHandler<PartyAActionsUnpaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyADeallocateCooldownUpdated(event: PartyADeallocateCooldownUpdated): void {
    let handler = new PartyADeallocateCooldownUpdatedHandler<PartyADeallocateCooldownUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyBActionsPaused(event: PartyBActionsPaused): void {
    let handler = new PartyBActionsPausedHandler<PartyBActionsPaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyBActionsUnpaused(event: PartyBActionsUnpaused): void {
    let handler = new PartyBActionsUnpausedHandler<PartyBActionsUnpaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyBConfigUpdated(event: PartyBConfigUpdated): void {
    let handler = new PartyBConfigUpdatedHandler<PartyBConfigUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyBDeallocateCooldownUpdated(event: PartyBDeallocateCooldownUpdated): void {
    let handler = new PartyBDeallocateCooldownUpdatedHandler<PartyBDeallocateCooldownUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyBEmergencyStatusActivated(event: PartyBEmergencyStatusActivated): void {
    let handler = new PartyBEmergencyStatusActivatedHandler<PartyBEmergencyStatusActivated>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyBEmergencyStatusDeactivated(event: PartyBEmergencyStatusDeactivated): void {
    let handler = new PartyBEmergencyStatusDeactivatedHandler<PartyBEmergencyStatusDeactivated>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePartyBReleaseIntervalUpdated(event: PartyBReleaseIntervalUpdated): void {
    let handler = new PartyBReleaseIntervalUpdatedHandler<PartyBReleaseIntervalUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handlePriceOracleAddressUpdated(event: PriceOracleAddressUpdated): void {
    let handler = new PriceOracleAddressUpdatedHandler<PriceOracleAddressUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleProposeToDeactivateInstantActionMode(event: ProposeToDeactivateInstantActionMode): void {
    let handler = new ProposeToDeactivateInstantActionModeHandler<ProposeToDeactivateInstantActionMode>()
    handler.handle(event, OpVersion.v_1)
}


export function handleRestoreBridgeTransaction(event: RestoreBridgeTransaction): void {
    let handler = new RestoreBridgeTransactionHandler<RestoreBridgeTransaction>()
    handler.handle(event, OpVersion.v_1)
}


export function handleRoleGranted(event: RoleGranted): void {
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, OpVersion.v_1)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, OpVersion.v_1)
}


export function handleRoleUpdated(event: RoleUpdated): void {
    let handler = new RoleUpdatedHandler<RoleUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleSendCloseIntent(event: SendCloseIntent): void {
    let handler = new SendCloseIntentHandler<SendCloseIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleSendTransferIntent(event: SendTransferIntent): void {
    let handler = new SendTransferIntentHandler<SendTransferIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleSettlementPriceSigValidTimeUpdated(event: SettlementPriceSigValidTimeUpdated): void {
    let handler = new SettlementPriceSigValidTimeUpdatedHandler<SettlementPriceSigValidTimeUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleSuspendBridgeTransaction(event: SuspendBridgeTransaction): void {
    let handler = new SuspendBridgeTransactionHandler<SuspendBridgeTransaction>()
    handler.handle(event, OpVersion.v_1)
}


export function handleSymbolAdded(event: SymbolAdded): void {
    let handler = new SymbolAddedHandler<SymbolAdded>()
    handler.handle(event, OpVersion.v_1)
}


export function handleSymbolPriceUpdated(event: SymbolPriceUpdated): void {
    let handler = new SymbolPriceUpdatedHandler<SymbolPriceUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleSyncBalances(event: SyncBalances): void {
    let handler = new SyncBalancesHandler<SyncBalances>()
    handler.handle(event, OpVersion.v_1)
}


export function handleTransferToBridge(event: TransferToBridge): void {
    let handler = new TransferToBridgeHandler<TransferToBridge>()
    handler.handle(event, OpVersion.v_1)
}


export function handleTransferTradeByPartyA(event: TransferTradeByPartyA): void {
    let handler = new TransferTradeByPartyAHandler<TransferTradeByPartyA>()
    handler.handle(event, OpVersion.v_1)
}


export function handleUnbindingCooldownUpdated(event: UnbindingCooldownUpdated): void {
    let handler = new UnbindingCooldownUpdatedHandler<UnbindingCooldownUpdated>()
    handler.handle(event, OpVersion.v_1)
}


export function handleUnflagLiquidation(event: UnflagLiquidation): void {
    let handler = new UnflagLiquidationHandler<UnflagLiquidation>()
    handler.handle(event, OpVersion.v_1)
}


export function handleUnlockOpenIntent(event: UnlockOpenIntent): void {
    let handler = new UnlockOpenIntentHandler<UnlockOpenIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleUnlockTransferIntent(event: UnlockTransferIntent): void {
    let handler = new UnlockTransferIntentHandler<UnlockTransferIntent>()
    handler.handle(event, OpVersion.v_1)
}


export function handleWithdrawPaused(event: WithdrawPaused): void {
    let handler = new WithdrawPausedHandler<WithdrawPaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleWithdrawReceivedBridgeValue(event: WithdrawReceivedBridgeValue): void {
    let handler = new WithdrawReceivedBridgeValueHandler<WithdrawReceivedBridgeValue>()
    handler.handle(event, OpVersion.v_1)
}


export function handleWithdrawReceivedBridgeValues(event: WithdrawReceivedBridgeValues): void {
    let handler = new WithdrawReceivedBridgeValuesHandler<WithdrawReceivedBridgeValues>()
    handler.handle(event, OpVersion.v_1)
}


export function handleWithdrawUnpaused(event: WithdrawUnpaused): void {
    let handler = new WithdrawUnpausedHandler<WithdrawUnpaused>()
    handler.handle(event, OpVersion.v_1)
}


export function handleWithdrawalSuspended(event: WithdrawalSuspended): void {
    let handler = new WithdrawalSuspendedHandler<WithdrawalSuspended>()
    handler.handle(event, OpVersion.v_1)
}
