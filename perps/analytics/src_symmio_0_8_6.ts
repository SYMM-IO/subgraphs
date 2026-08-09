import {ADLCloseHandler} from './handlers/symmio/ADLCloseHandler'
import {ADLClose} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AcceptCancelCloseRequestHandler} from './handlers/symmio/AcceptCancelCloseRequestHandler'
import {AcceptCancelCloseRequest} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AcceptCancelRequestHandler} from './handlers/symmio/AcceptCancelRequestHandler'
import {AcceptCancelRequest} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AccumulatedFundingStateUpdatedHandler} from './handlers/symmio/AccumulatedFundingStateUpdatedHandler'
import {AccumulatedFundingStateUpdated} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AddBridgeHandler} from './handlers/symmio/AddBridgeHandler'
import {AddBridge} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AddSymbolHandler} from './handlers/symmio/AddSymbolHandler'
import {AddSymbol} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AdjustmentCancelledHandler} from './handlers/symmio/AdjustmentCancelledHandler'
import {AdjustmentCancelled} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AdjustmentScheduledHandler} from './handlers/symmio/AdjustmentScheduledHandler'
import {AdjustmentScheduled} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {AllocateForPartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {AllocatePartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {AutoTakeoverPartyALiquidationHandler} from './handlers/symmio/AutoTakeoverPartyALiquidationHandler'
import {AutoTakeoverPartyALiquidation} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {BalanceChangePartyAHandler} from './handlers/symmio/BalanceChangePartyAHandler'
import {BalanceChangePartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {BalanceChangePartyBHandler} from './handlers/symmio/BalanceChangePartyBHandler'
import {BalanceChangePartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ChargeAccumulatedFundingFeeHandler} from './handlers/symmio/ChargeAccumulatedFundingFeeHandler'
import {ChargeAccumulatedFundingFee} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ChargeFundingRateHandler} from './handlers/symmio/ChargeFundingRateHandler'
import {ChargeFundingRate} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {CloseSolverFeeChargedHandler} from './handlers/symmio/CloseSolverFeeChargedHandler'
import {CloseSolverFeeCharged} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocateForPartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {DeallocatePartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {DeferredLiquidatePartyAHandler} from './handlers/symmio/DeferredLiquidatePartyAHandler'
import {DeferredLiquidatePartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {Deposit1} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {DepositHandler} from './handlers/symmio/DepositHandler'
import {EmergencyClosePositionHandler} from './handlers/symmio/EmergencyClosePositionHandler'
import {EmergencyClosePosition} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ExpireQuoteCloseHandler} from './handlers/symmio/ExpireQuoteCloseHandler'
import {ExpireQuoteClose} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ExpireQuoteOpenHandler} from './handlers/symmio/ExpireQuoteOpenHandler'
import {ExpireQuoteOpen} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ForceCancelCloseRequestHandler} from './handlers/symmio/ForceCancelCloseRequestHandler'
import {ForceCancelCloseRequest} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ForceCancelQuoteHandler} from './handlers/symmio/ForceCancelQuoteHandler'
import {ForceCancelQuote} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ForceClosePartyBInsolventHandler} from './handlers/symmio/ForceClosePartyBInsolventHandler'
import {ForceClosePartyBInsolvent} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ForceClosePositionHandler} from './handlers/symmio/ForceClosePositionHandler'
import {ForceClosePosition} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {FullyLiquidatedPartyAHandler} from './handlers/symmio/FullyLiquidatedPartyAHandler'
import {FullyLiquidatedPartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidateCrossPartyBHandler} from './handlers/symmio/LiquidateCrossPartyBHandler'
import {LiquidateCrossPartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePendingPositionsForClearingHouseHandler} from './handlers/symmio/LiquidatePendingPositionsForClearingHouseHandler'
import {LiquidatePendingPositionsForClearingHouse} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePendingPositionsPartyAHandler} from './handlers/symmio/LiquidatePendingPositionsPartyAHandler'
import {LiquidatePendingPositionsPartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePositionsForClearingHouseHandler} from './handlers/symmio/LiquidatePositionsForClearingHouseHandler'
import {LiquidatePositionsForClearingHouse} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidationDisputedHandler} from './handlers/symmio/LiquidationDisputedHandler'
import {LiquidationDisputed} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LiquidationEscrowCreatedHandler} from './handlers/symmio/LiquidationEscrowCreatedHandler'
import {LiquidationEscrowCreated} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {LockQuoteHandler} from './handlers/symmio/LockQuoteHandler'
import {LockQuote} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {OpenSolverFeeChargedHandler} from './handlers/symmio/OpenSolverFeeChargedHandler'
import {OpenSolverFeeCharged} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {PartyAReimbursementChangeHandler} from './handlers/symmio/PartyAReimbursementChangeHandler'
import {PartyAReimbursementChange} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {PendingQuoteCancelledByAdjustmentHandler} from './handlers/symmio/PendingQuoteCancelledByAdjustmentHandler'
import {PendingQuoteCancelledByAdjustment} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {PriceAdjustmentConfirmedHandler} from './handlers/symmio/PriceAdjustmentConfirmedHandler'
import {PriceAdjustmentConfirmed} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {QuoteAdjustedHandler} from './handlers/symmio/QuoteAdjustedHandler'
import {QuoteAdjusted} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RegisterExpressProviderHandler} from './handlers/symmio/RegisterExpressProviderHandler'
import {RegisterExpressProvider} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RegisterPartyBHandler} from './handlers/symmio/RegisterPartyBHandler'
import {RegisterPartyB} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RequestToCancelCloseRequestHandler} from './handlers/symmio/RequestToCancelCloseRequestHandler'
import {RequestToCancelCloseRequest} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RequestToCancelQuoteHandler} from './handlers/symmio/RequestToCancelQuoteHandler'
import {RequestToCancelQuote} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RequestToClosePositionHandler} from './handlers/symmio/RequestToClosePositionHandler'
import {RequestToClosePosition} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ResolveLiquidationDisputeHandler} from './handlers/symmio/ResolveLiquidationDisputeHandler'
import {ResolveLiquidationDispute} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RestatementAbortedHandler} from './handlers/symmio/RestatementAbortedHandler'
import {RestatementAborted} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RestatementFinalizedHandler} from './handlers/symmio/RestatementFinalizedHandler'
import {RestatementFinalized} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RestatementStartedHandler} from './handlers/symmio/RestatementStartedHandler'
import {RestatementStarted} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RoleGrantedHandler} from './handlers/symmio/RoleGrantedHandler'
import {RoleGranted} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {RoleRevokedHandler} from './handlers/symmio/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetCollateralHandler} from './handlers/symmio/SetCollateralHandler'
import {SetCollateral} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetEntityMetadataHandler} from './handlers/symmio/SetEntityMetadataHandler'
import {SetEntityMetadata} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetEpochDurationHandler} from './handlers/symmio/SetEpochDurationHandler'
import {SetEpochDuration} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetFeeCollectorHandler} from './handlers/symmio/SetFeeCollectorHandler'
import {SetFeeCollector} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetLongFundingFeeHandler} from './handlers/symmio/SetLongFundingFeeHandler'
import {SetLongFundingFee} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetPartyALiquidationSnapshotHandler} from './handlers/symmio/SetPartyALiquidationSnapshotHandler'
import {SetPartyALiquidationSnapshot} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetShortFundingFeeHandler} from './handlers/symmio/SetShortFundingFeeHandler'
import {SetShortFundingFee} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetSymbolFundingStateHandler} from './handlers/symmio/SetSymbolFundingStateHandler'
import {SetSymbolFundingState} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetSymbolTradingFeeHandler} from './handlers/symmio/SetSymbolTradingFeeHandler'
import {SetSymbolTradingFee} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetSymbolValidationStateHandler} from './handlers/symmio/SetSymbolValidationStateHandler'
import {SetSymbolValidationState} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SetSymbolsPrices} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SettleCrossPartyBLiquidationHandler} from './handlers/symmio/SettleCrossPartyBLiquidationHandler'
import {SettleCrossPartyBLiquidation} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SettlePartyALiquidation1} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {SettlePartyATakeoverHandler} from './handlers/symmio/SettlePartyATakeoverHandler'
import {SettlePartyATakeover} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SettlePartyBUpnlForLiquidationHandler} from './handlers/symmio/SettlePartyBUpnlForLiquidationHandler'
import {SettlePartyBUpnlForLiquidation} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SettleUpnlHandler} from './handlers/symmio/SettleUpnlHandler'
import {SettleUpnlUnifiedHandler} from './handlers/symmio/SettleUpnlUnifiedHandler'
import {SettleUpnlUnified} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SettleUpnl} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {SoftPartyBLiquidationHandler} from './handlers/symmio/SoftPartyBLiquidationHandler'
import {SoftPartyBLiquidation} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {TakeoverPartyALiquidationHandler} from './handlers/symmio/TakeoverPartyALiquidationHandler'
import {TakeoverPartyALiquidation} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {TradingFeeChargedHandler} from './handlers/symmio/TradingFeeChargedHandler'
import {TradingFeeCharged} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {TransferToBridgeHandler} from './handlers/symmio/TransferToBridgeHandler'
import {TransferToBridge} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {UnlockQuoteHandler} from './handlers/symmio/UnlockQuoteHandler'
import {UnlockQuote} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {UpdateAccumulatedFundingFeeHandler} from './handlers/symmio/UpdateAccumulatedFundingFeeHandler'
import {UpdateAccumulatedFundingFee} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {Version} from '../common/BaseHandler'
import {WithdrawAcceptedHandler} from './handlers/symmio/WithdrawAcceptedHandler'
import {WithdrawAccepted} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawAdvancedHandler} from './handlers/symmio/WithdrawAdvancedHandler'
import {WithdrawAdvanced} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawCancelRequestedHandler} from './handlers/symmio/WithdrawCancelRequestedHandler'
import {WithdrawCancelRequested} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawCancelledHandler} from './handlers/symmio/WithdrawCancelledHandler'
import {WithdrawCancelled} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawFinalizedHandler} from './handlers/symmio/WithdrawFinalizedHandler'
import {WithdrawFinalized} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawHandler} from './handlers/symmio/WithdrawHandler'
import {WithdrawInitiatedHandler} from './handlers/symmio/WithdrawInitiatedHandler'
import {WithdrawInitiated} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawRejectedHandler} from './handlers/symmio/WithdrawRejectedHandler'
import {WithdrawRejected} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawSpeedUpAcceptedHandler} from './handlers/symmio/WithdrawSpeedUpAcceptedHandler'
import {WithdrawSpeedUpAccepted} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {WithdrawSuspendedHandler} from './handlers/symmio/WithdrawSuspendedHandler'
import {WithdrawSuspended} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {Withdraw} from '../../generated/symmio_0_8_6/symmio_0_8_6'
import {ensureSyncMeta} from './src_sync_meta'
import {ethereum} from '@graphprotocol/graph-ts'
import {handleLatestAccountBalanceBlock as handleLatestAccountBalanceBlockImpl} from './src_latest_account_balance_block'


export function handleADLClose(event: ADLClose): void {
    ensureSyncMeta(event.block)
    let handler = new ADLCloseHandler<ADLClose>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
    ensureSyncMeta(event.block)
    let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAccumulatedFundingStateUpdated(event: AccumulatedFundingStateUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new AccumulatedFundingStateUpdatedHandler<AccumulatedFundingStateUpdated>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAddBridge(event: AddBridge): void {
    ensureSyncMeta(event.block)
    let handler = new AddBridgeHandler<AddBridge>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAddSymbol(event: AddSymbol): void {
    ensureSyncMeta(event.block)
    let handler = new AddSymbolHandler<AddSymbol>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAdjustmentCancelled(event: AdjustmentCancelled): void {
    ensureSyncMeta(event.block)
    let handler = new AdjustmentCancelledHandler<AdjustmentCancelled>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAdjustmentScheduled(event: AdjustmentScheduled): void {
    ensureSyncMeta(event.block)
    let handler = new AdjustmentScheduledHandler<AdjustmentScheduled>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAllocateForPartyB(event: AllocateForPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAllocatePartyA(event: AllocatePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new AllocatePartyAHandler<AllocatePartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleAutoTakeoverPartyALiquidation(event: AutoTakeoverPartyALiquidation): void {
    ensureSyncMeta(event.block)
    let handler = new AutoTakeoverPartyALiquidationHandler<AutoTakeoverPartyALiquidation>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleBalanceChangePartyA(event: BalanceChangePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new BalanceChangePartyAHandler<BalanceChangePartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleBalanceChangePartyB(event: BalanceChangePartyB): void {
    ensureSyncMeta(event.block)
    let handler = new BalanceChangePartyBHandler<BalanceChangePartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleChargeAccumulatedFundingFee(event: ChargeAccumulatedFundingFee): void {
    ensureSyncMeta(event.block)
    let handler = new ChargeAccumulatedFundingFeeHandler<ChargeAccumulatedFundingFee>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleChargeFundingRate(event: ChargeFundingRate): void {
    ensureSyncMeta(event.block)
    let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleCloseSolverFeeCharged(event: CloseSolverFeeCharged): void {
    ensureSyncMeta(event.block)
    let handler = new CloseSolverFeeChargedHandler<CloseSolverFeeCharged>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleDeallocatePartyA(event: DeallocatePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleDeferredLiquidatePartyA(event: DeferredLiquidatePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new DeferredLiquidatePartyAHandler<DeferredLiquidatePartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleDeposit1(event: Deposit1): void {
    ensureSyncMeta(event.block)
    let handler = new DepositHandler<Deposit1>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
    ensureSyncMeta(event.block)
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleExpireQuoteClose(event: ExpireQuoteClose): void {
    ensureSyncMeta(event.block)
    let handler = new ExpireQuoteCloseHandler<ExpireQuoteClose>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleExpireQuoteOpen(event: ExpireQuoteOpen): void {
    ensureSyncMeta(event.block)
    let handler = new ExpireQuoteOpenHandler<ExpireQuoteOpen>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleFillCloseRequest(event: FillCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new FillCloseRequestHandler<FillCloseRequest>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleForceCancelQuote(event: ForceCancelQuote): void {
    ensureSyncMeta(event.block)
    let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleForceClosePartyBInsolvent(event: ForceClosePartyBInsolvent): void {
    ensureSyncMeta(event.block)
    let handler = new ForceClosePartyBInsolventHandler<ForceClosePartyBInsolvent>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleForceClosePosition(event: ForceClosePosition): void {
    ensureSyncMeta(event.block)
    let handler = new ForceClosePositionHandler<ForceClosePosition>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleFullyLiquidatedPartyA(event: FullyLiquidatedPartyA): void {
    ensureSyncMeta(event.block)
    let handler = new FullyLiquidatedPartyAHandler<FullyLiquidatedPartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidateCrossPartyB(event: LiquidateCrossPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidateCrossPartyBHandler<LiquidateCrossPartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePartyA(event: LiquidatePartyA): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePendingPositionsForClearingHouse(event: LiquidatePendingPositionsForClearingHouse): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePendingPositionsForClearingHouseHandler<LiquidatePendingPositionsForClearingHouse>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePositionsForClearingHouse(event: LiquidatePositionsForClearingHouse): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsForClearingHouseHandler<LiquidatePositionsForClearingHouse>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidationDisputed(event: LiquidationDisputed): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLiquidationEscrowCreated(event: LiquidationEscrowCreated): void {
    ensureSyncMeta(event.block)
    let handler = new LiquidationEscrowCreatedHandler<LiquidationEscrowCreated>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLockQuote(event: LockQuote): void {
    ensureSyncMeta(event.block)
    let handler = new LockQuoteHandler<LockQuote>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleOpenPosition(event: OpenPosition): void {
    ensureSyncMeta(event.block)
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleOpenSolverFeeCharged(event: OpenSolverFeeCharged): void {
    ensureSyncMeta(event.block)
    let handler = new OpenSolverFeeChargedHandler<OpenSolverFeeCharged>()
    handler.handle(event, Version.v_0_8_6)
}


export function handlePartyAReimbursementChange(event: PartyAReimbursementChange): void {
    ensureSyncMeta(event.block)
    let handler = new PartyAReimbursementChangeHandler<PartyAReimbursementChange>()
    handler.handle(event, Version.v_0_8_6)
}


export function handlePendingQuoteCancelledByAdjustment(event: PendingQuoteCancelledByAdjustment): void {
    ensureSyncMeta(event.block)
    let handler = new PendingQuoteCancelledByAdjustmentHandler<PendingQuoteCancelledByAdjustment>()
    handler.handle(event, Version.v_0_8_6)
}


export function handlePriceAdjustmentConfirmed(event: PriceAdjustmentConfirmed): void {
    ensureSyncMeta(event.block)
    let handler = new PriceAdjustmentConfirmedHandler<PriceAdjustmentConfirmed>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleQuoteAdjusted(event: QuoteAdjusted): void {
    ensureSyncMeta(event.block)
    let handler = new QuoteAdjustedHandler<QuoteAdjusted>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRegisterExpressProvider(event: RegisterExpressProvider): void {
    ensureSyncMeta(event.block)
    let handler = new RegisterExpressProviderHandler<RegisterExpressProvider>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRegisterPartyB(event: RegisterPartyB): void {
    ensureSyncMeta(event.block)
    let handler = new RegisterPartyBHandler<RegisterPartyB>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
    ensureSyncMeta(event.block)
    let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
    ensureSyncMeta(event.block)
    let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRequestToClosePosition(event: RequestToClosePosition): void {
    ensureSyncMeta(event.block)
    let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleResolveLiquidationDispute(event: ResolveLiquidationDispute): void {
    ensureSyncMeta(event.block)
    let handler = new ResolveLiquidationDisputeHandler<ResolveLiquidationDispute>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRestatementAborted(event: RestatementAborted): void {
    ensureSyncMeta(event.block)
    let handler = new RestatementAbortedHandler<RestatementAborted>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRestatementFinalized(event: RestatementFinalized): void {
    ensureSyncMeta(event.block)
    let handler = new RestatementFinalizedHandler<RestatementFinalized>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRestatementStarted(event: RestatementStarted): void {
    ensureSyncMeta(event.block)
    let handler = new RestatementStartedHandler<RestatementStarted>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRoleGranted(event: RoleGranted): void {
    ensureSyncMeta(event.block)
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    ensureSyncMeta(event.block)
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSendQuote(event: SendQuote): void {
    ensureSyncMeta(event.block)
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetCollateral(event: SetCollateral): void {
    ensureSyncMeta(event.block)
    let handler = new SetCollateralHandler<SetCollateral>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetEntityMetadata(event: SetEntityMetadata): void {
    ensureSyncMeta(event.block)
    let handler = new SetEntityMetadataHandler<SetEntityMetadata>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetEpochDuration(event: SetEpochDuration): void {
    ensureSyncMeta(event.block)
    let handler = new SetEpochDurationHandler<SetEpochDuration>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetFeeCollector(event: SetFeeCollector): void {
    ensureSyncMeta(event.block)
    let handler = new SetFeeCollectorHandler<SetFeeCollector>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetLongFundingFee(event: SetLongFundingFee): void {
    ensureSyncMeta(event.block)
    let handler = new SetLongFundingFeeHandler<SetLongFundingFee>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetPartyALiquidationSnapshot(event: SetPartyALiquidationSnapshot): void {
    ensureSyncMeta(event.block)
    let handler = new SetPartyALiquidationSnapshotHandler<SetPartyALiquidationSnapshot>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetShortFundingFee(event: SetShortFundingFee): void {
    ensureSyncMeta(event.block)
    let handler = new SetShortFundingFeeHandler<SetShortFundingFee>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetSymbolFundingState(event: SetSymbolFundingState): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolFundingStateHandler<SetSymbolFundingState>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
    ensureSyncMeta(event.block)
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSettleCrossPartyBLiquidation(event: SettleCrossPartyBLiquidation): void {
    ensureSyncMeta(event.block)
    let handler = new SettleCrossPartyBLiquidationHandler<SettleCrossPartyBLiquidation>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSettlePartyALiquidation1(event: SettlePartyALiquidation1): void {
    ensureSyncMeta(event.block)
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation1>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSettlePartyATakeover(event: SettlePartyATakeover): void {
    ensureSyncMeta(event.block)
    let handler = new SettlePartyATakeoverHandler<SettlePartyATakeover>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSettlePartyBUpnlForLiquidation(event: SettlePartyBUpnlForLiquidation): void {
    ensureSyncMeta(event.block)
    let handler = new SettlePartyBUpnlForLiquidationHandler<SettlePartyBUpnlForLiquidation>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSettleUpnl(event: SettleUpnl): void {
    ensureSyncMeta(event.block)
    let handler = new SettleUpnlHandler<SettleUpnl>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSettleUpnlUnified(event: SettleUpnlUnified): void {
    ensureSyncMeta(event.block)
    let handler = new SettleUpnlUnifiedHandler<SettleUpnlUnified>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleSoftPartyBLiquidation(event: SoftPartyBLiquidation): void {
    ensureSyncMeta(event.block)
    let handler = new SoftPartyBLiquidationHandler<SoftPartyBLiquidation>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleTakeoverPartyALiquidation(event: TakeoverPartyALiquidation): void {
    ensureSyncMeta(event.block)
    let handler = new TakeoverPartyALiquidationHandler<TakeoverPartyALiquidation>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleTradingFeeCharged(event: TradingFeeCharged): void {
    ensureSyncMeta(event.block)
    let handler = new TradingFeeChargedHandler<TradingFeeCharged>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleTransferToBridge(event: TransferToBridge): void {
    ensureSyncMeta(event.block)
    let handler = new TransferToBridgeHandler<TransferToBridge>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleUnlockQuote(event: UnlockQuote): void {
    ensureSyncMeta(event.block)
    let handler = new UnlockQuoteHandler<UnlockQuote>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleUpdateAccumulatedFundingFee(event: UpdateAccumulatedFundingFee): void {
    ensureSyncMeta(event.block)
    let handler = new UpdateAccumulatedFundingFeeHandler<UpdateAccumulatedFundingFee>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdraw(event: Withdraw): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawHandler<Withdraw>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawAccepted(event: WithdrawAccepted): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawAcceptedHandler<WithdrawAccepted>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawAdvanced(event: WithdrawAdvanced): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawAdvancedHandler<WithdrawAdvanced>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawCancelRequested(event: WithdrawCancelRequested): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawCancelRequestedHandler<WithdrawCancelRequested>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawCancelled(event: WithdrawCancelled): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawCancelledHandler<WithdrawCancelled>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawFinalized(event: WithdrawFinalized): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawFinalizedHandler<WithdrawFinalized>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawInitiated(event: WithdrawInitiated): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawInitiatedHandler<WithdrawInitiated>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawRejected(event: WithdrawRejected): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawRejectedHandler<WithdrawRejected>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawSpeedUpAccepted(event: WithdrawSpeedUpAccepted): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawSpeedUpAcceptedHandler<WithdrawSpeedUpAccepted>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleWithdrawSuspended(event: WithdrawSuspended): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawSuspendedHandler<WithdrawSuspended>()
    handler.handle(event, Version.v_0_8_6)
}


export function handleLatestAccountBalanceBlock(block: ethereum.Block): void {
    handleLatestAccountBalanceBlockImpl(block, Version.v_0_8_6)
}
