import {ethereum} from '@graphprotocol/graph-ts'
import {handleLatestAccountBalanceBlock as handleLatestAccountBalanceBlockImpl} from './src_latest_account_balance_block'
import {AcceptCancelCloseRequestHandler} from './handlers/symmio/AcceptCancelCloseRequestHandler'
import {AcceptCancelCloseRequest} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {AcceptCancelRequestHandler} from './handlers/symmio/AcceptCancelRequestHandler'
import {AcceptCancelRequest} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {AddBridgeHandler} from './handlers/symmio/AddBridgeHandler'
import {AddBridge} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {AddSymbolHandler} from './handlers/symmio/AddSymbolHandler'
import {AddSymbol} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {AllocateForPartyB} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {AllocatePartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {BalanceChangePartyAHandler} from './handlers/symmio/BalanceChangePartyAHandler'
import {BalanceChangePartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {BalanceChangePartyBHandler} from './handlers/symmio/BalanceChangePartyBHandler'
import {BalanceChangePartyB} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ChargeFundingRateHandler} from './handlers/symmio/ChargeFundingRateHandler'
import {ChargeFundingRate} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocateForPartyB} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {DeallocatePartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {DeferredLiquidatePartyAHandler} from './handlers/symmio/DeferredLiquidatePartyAHandler'
import {DeferredLiquidatePartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {DepositHandler} from './handlers/symmio/DepositHandler'
import {Deposit} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {EmergencyClosePositionHandler} from './handlers/symmio/EmergencyClosePositionHandler'
import {EmergencyClosePosition} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ExpireQuoteCloseHandler} from './handlers/symmio/ExpireQuoteCloseHandler'
import {ExpireQuoteClose} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ExpireQuoteOpenHandler} from './handlers/symmio/ExpireQuoteOpenHandler'
import {ExpireQuoteOpen} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ForceCancelCloseRequestHandler} from './handlers/symmio/ForceCancelCloseRequestHandler'
import {ForceCancelCloseRequest} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ForceCancelQuoteHandler} from './handlers/symmio/ForceCancelQuoteHandler'
import {ForceCancelQuote} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ForceClosePositionHandler} from './handlers/symmio/ForceClosePositionHandler'
import {ForceClosePosition} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {FullyLiquidatedPartyAHandler} from './handlers/symmio/FullyLiquidatedPartyAHandler'
import {FullyLiquidatedPartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {LiquidatePendingPositionsPartyAHandler} from './handlers/symmio/LiquidatePendingPositionsPartyAHandler'
import {LiquidatePendingPositionsPartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {LiquidationDisputedHandler} from './handlers/symmio/LiquidationDisputedHandler'
import {LiquidationDisputed} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ResolveLiquidationDisputeHandler} from './handlers/symmio/ResolveLiquidationDisputeHandler'
import {ResolveLiquidationDispute} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {LockQuoteHandler} from './handlers/symmio/LockQuoteHandler'
import {LockQuote} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {RegisterPartyBHandler} from './handlers/symmio/RegisterPartyBHandler'
import {RegisterPartyB} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {RequestToCancelCloseRequestHandler} from './handlers/symmio/RequestToCancelCloseRequestHandler'
import {RequestToCancelCloseRequest} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {RequestToCancelQuoteHandler} from './handlers/symmio/RequestToCancelQuoteHandler'
import {RequestToCancelQuote} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {RequestToClosePositionHandler} from './handlers/symmio/RequestToClosePositionHandler'
import {RequestToClosePosition} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {RoleGrantedHandler} from './handlers/symmio/RoleGrantedHandler'
import {RoleGranted} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {RoleRevokedHandler} from './handlers/symmio/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SetCollateralHandler} from './handlers/symmio/SetCollateralHandler'
import {SetCollateral} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SetFeeCollectorHandler} from './handlers/symmio/SetFeeCollectorHandler'
import {SetFeeCollector} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SetSymbolFundingStateHandler} from './handlers/symmio/SetSymbolFundingStateHandler'
import {SetSymbolFundingState} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SetSymbolTradingFeeHandler} from './handlers/symmio/SetSymbolTradingFeeHandler'
import {SetSymbolTradingFee} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SetSymbolValidationStateHandler} from './handlers/symmio/SetSymbolValidationStateHandler'
import {SetSymbolValidationState} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SetSymbolsPrices} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {SettlePartyALiquidation} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {SettleUpnlHandler} from './handlers/symmio/SettleUpnlHandler'
import {SettleUpnl} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {TransferToBridgeHandler} from './handlers/symmio/TransferToBridgeHandler'
import {TransferToBridge} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {UnlockQuoteHandler} from './handlers/symmio/UnlockQuoteHandler'
import {UnlockQuote} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {Version} from '../common/BaseHandler'
import {WithdrawHandler} from './handlers/symmio/WithdrawHandler'
import {Withdraw} from '../../generated/symmio_0_8_4/symmio_0_8_4'
import {ensureSyncMeta} from './src_sync_meta'


export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	ensureSyncMeta(event.block)
    let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleAddBridge(event: AddBridge): void {
	ensureSyncMeta(event.block)
    let handler = new AddBridgeHandler<AddBridge>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleAddSymbol(event: AddSymbol): void {
	ensureSyncMeta(event.block)
    let handler = new AddSymbolHandler<AddSymbol>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleAllocatePartyA(event: AllocatePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new AllocatePartyAHandler<AllocatePartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleBalanceChangePartyA(event: BalanceChangePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new BalanceChangePartyAHandler<BalanceChangePartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleBalanceChangePartyB(event: BalanceChangePartyB): void {
	ensureSyncMeta(event.block)
    let handler = new BalanceChangePartyBHandler<BalanceChangePartyB>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleChargeFundingRate(event: ChargeFundingRate): void {
	ensureSyncMeta(event.block)
    let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleDeferredLiquidatePartyA(event: DeferredLiquidatePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new DeferredLiquidatePartyAHandler<DeferredLiquidatePartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleDeposit(event: Deposit): void {
	ensureSyncMeta(event.block)
    let handler = new DepositHandler<Deposit>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	ensureSyncMeta(event.block)
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleExpireQuoteClose(event: ExpireQuoteClose): void {
	ensureSyncMeta(event.block)
    let handler = new ExpireQuoteCloseHandler<ExpireQuoteClose>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleExpireQuoteOpen(event: ExpireQuoteOpen): void {
	ensureSyncMeta(event.block)
    let handler = new ExpireQuoteOpenHandler<ExpireQuoteOpen>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleFillCloseRequest(event: FillCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new FillCloseRequestHandler<FillCloseRequest>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleForceCancelQuote(event: ForceCancelQuote): void {
	ensureSyncMeta(event.block)
    let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleForceClosePosition(event: ForceClosePosition): void {
	ensureSyncMeta(event.block)
    let handler = new ForceClosePositionHandler<ForceClosePosition>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleFullyLiquidatedPartyA(event: FullyLiquidatedPartyA): void {
	ensureSyncMeta(event.block)
    let handler = new FullyLiquidatedPartyAHandler<FullyLiquidatedPartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLiquidationDisputed(event: LiquidationDisputed): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleResolveLiquidationDispute(event: ResolveLiquidationDispute): void {
	ensureSyncMeta(event.block)
    let handler = new ResolveLiquidationDisputeHandler<ResolveLiquidationDispute>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLockQuote(event: LockQuote): void {
	ensureSyncMeta(event.block)
    let handler = new LockQuoteHandler<LockQuote>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleOpenPosition(event: OpenPosition): void {
	ensureSyncMeta(event.block)
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleRegisterPartyB(event: RegisterPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new RegisterPartyBHandler<RegisterPartyB>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	ensureSyncMeta(event.block)
    let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	ensureSyncMeta(event.block)
    let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleRoleGranted(event: RoleGranted): void {
	ensureSyncMeta(event.block)
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleRoleRevoked(event: RoleRevoked): void {
	ensureSyncMeta(event.block)
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSendQuote(event: SendQuote): void {
	ensureSyncMeta(event.block)
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSetCollateral(event: SetCollateral): void {
	ensureSyncMeta(event.block)
    let handler = new SetCollateralHandler<SetCollateral>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSetFeeCollector(event: SetFeeCollector): void {
	ensureSyncMeta(event.block)
    let handler = new SetFeeCollectorHandler<SetFeeCollector>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSetSymbolFundingState(event: SetSymbolFundingState): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolFundingStateHandler<SetSymbolFundingState>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
	ensureSyncMeta(event.block)
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleSettleUpnl(event: SettleUpnl): void {
	ensureSyncMeta(event.block)
    let handler = new SettleUpnlHandler<SettleUpnl>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleTransferToBridge(event: TransferToBridge): void {
	ensureSyncMeta(event.block)
    let handler = new TransferToBridgeHandler<TransferToBridge>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleUnlockQuote(event: UnlockQuote): void {
	ensureSyncMeta(event.block)
    let handler = new UnlockQuoteHandler<UnlockQuote>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleWithdraw(event: Withdraw): void {
	ensureSyncMeta(event.block)
    let handler = new WithdrawHandler<Withdraw>()
    handler.handle(event, Version.v_0_8_4)
}


export function handleLatestAccountBalanceBlock(block: ethereum.Block): void {
    handleLatestAccountBalanceBlockImpl(block)
}
