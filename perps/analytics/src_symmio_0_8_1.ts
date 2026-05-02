import {AcceptCancelCloseRequestHandler} from './handlers/symmio/AcceptCancelCloseRequestHandler'
import {AcceptCancelCloseRequest} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {AcceptCancelRequestHandler} from './handlers/symmio/AcceptCancelRequestHandler'
import {AcceptCancelRequest} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {AddSymbolHandler} from './handlers/symmio/AddSymbolHandler'
import {AddSymbol} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {AllocateForPartyB} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {AllocatePartyA} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {ChargeFundingRateHandler} from './handlers/symmio/ChargeFundingRateHandler'
import {ChargeFundingRate} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocateForPartyB} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {DeallocatePartyA} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {DepositHandler} from './handlers/symmio/DepositHandler'
import {Deposit} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {EmergencyClosePositionHandler} from './handlers/symmio/EmergencyClosePositionHandler'
import {EmergencyClosePosition} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {ExpireQuoteHandler} from './handlers/symmio/ExpireQuoteHandler'
import {ExpireQuote} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {ForceCancelCloseRequestHandler} from './handlers/symmio/ForceCancelCloseRequestHandler'
import {ForceCancelCloseRequest} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {ForceCancelQuoteHandler} from './handlers/symmio/ForceCancelQuoteHandler'
import {ForceCancelQuote} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {ForceClosePositionHandler} from './handlers/symmio/ForceClosePositionHandler'
import {ForceClosePosition} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {LiquidatePendingPositionsPartyAHandler} from './handlers/symmio/LiquidatePendingPositionsPartyAHandler'
import {LiquidatePendingPositionsPartyA} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {LiquidationDisputedHandler} from './handlers/symmio/LiquidationDisputedHandler'
import {LiquidationDisputed} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {LockQuoteHandler} from './handlers/symmio/LockQuoteHandler'
import {LockQuote} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {RegisterPartyBHandler} from './handlers/symmio/RegisterPartyBHandler'
import {RegisterPartyB} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {RequestToCancelCloseRequestHandler} from './handlers/symmio/RequestToCancelCloseRequestHandler'
import {RequestToCancelCloseRequest} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {RequestToCancelQuoteHandler} from './handlers/symmio/RequestToCancelQuoteHandler'
import {RequestToCancelQuote} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {RequestToClosePositionHandler} from './handlers/symmio/RequestToClosePositionHandler'
import {RequestToClosePosition} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {RoleGrantedHandler} from './handlers/symmio/RoleGrantedHandler'
import {RoleGranted} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {RoleRevokedHandler} from './handlers/symmio/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {SetCollateralHandler} from './handlers/symmio/SetCollateralHandler'
import {SetCollateral} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {SetSymbolFundingStateHandler} from './handlers/symmio/SetSymbolFundingStateHandler'
import {SetSymbolFundingState} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {SetSymbolTradingFeeHandler} from './handlers/symmio/SetSymbolTradingFeeHandler'
import {SetSymbolTradingFee} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {SetSymbolValidationStateHandler} from './handlers/symmio/SetSymbolValidationStateHandler'
import {SetSymbolValidationState} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SetSymbolsPrices} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {SettlePartyALiquidation} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {UnlockQuoteHandler} from './handlers/symmio/UnlockQuoteHandler'
import {UnlockQuote} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {Version} from '../common/BaseHandler'
import {WithdrawHandler} from './handlers/symmio/WithdrawHandler'
import {Withdraw} from '../../generated/symmio_0_8_1/symmio_0_8_1'
import {ensureSyncMeta} from './src_sync_meta'


export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	ensureSyncMeta(event.block)
    let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleAddSymbol(event: AddSymbol): void {
	ensureSyncMeta(event.block)
    let handler = new AddSymbolHandler<AddSymbol>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleAllocatePartyA(event: AllocatePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new AllocatePartyAHandler<AllocatePartyA>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleChargeFundingRate(event: ChargeFundingRate): void {
	ensureSyncMeta(event.block)
    let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleDeposit(event: Deposit): void {
	ensureSyncMeta(event.block)
    let handler = new DepositHandler<Deposit>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	ensureSyncMeta(event.block)
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleExpireQuote(event: ExpireQuote): void {
	ensureSyncMeta(event.block)
    let handler = new ExpireQuoteHandler<ExpireQuote>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleFillCloseRequest(event: FillCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new FillCloseRequestHandler<FillCloseRequest>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleForceCancelQuote(event: ForceCancelQuote): void {
	ensureSyncMeta(event.block)
    let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleForceClosePosition(event: ForceClosePosition): void {
	ensureSyncMeta(event.block)
    let handler = new ForceClosePositionHandler<ForceClosePosition>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleLiquidationDisputed(event: LiquidationDisputed): void {
	ensureSyncMeta(event.block)
    let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleLockQuote(event: LockQuote): void {
	ensureSyncMeta(event.block)
    let handler = new LockQuoteHandler<LockQuote>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleOpenPosition(event: OpenPosition): void {
	ensureSyncMeta(event.block)
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleRegisterPartyB(event: RegisterPartyB): void {
	ensureSyncMeta(event.block)
    let handler = new RegisterPartyBHandler<RegisterPartyB>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	ensureSyncMeta(event.block)
    let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	ensureSyncMeta(event.block)
    let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	ensureSyncMeta(event.block)
    let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleRoleGranted(event: RoleGranted): void {
	ensureSyncMeta(event.block)
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleRoleRevoked(event: RoleRevoked): void {
	ensureSyncMeta(event.block)
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleSendQuote(event: SendQuote): void {
	ensureSyncMeta(event.block)
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleSetCollateral(event: SetCollateral): void {
	ensureSyncMeta(event.block)
    let handler = new SetCollateralHandler<SetCollateral>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleSetSymbolFundingState(event: SetSymbolFundingState): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolFundingStateHandler<SetSymbolFundingState>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolTradingFeeHandler<SetSymbolTradingFee>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleSetSymbolValidationState(event: SetSymbolValidationState): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolValidationStateHandler<SetSymbolValidationState>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	ensureSyncMeta(event.block)
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
	ensureSyncMeta(event.block)
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleUnlockQuote(event: UnlockQuote): void {
	ensureSyncMeta(event.block)
    let handler = new UnlockQuoteHandler<UnlockQuote>()
    handler.handle(event, Version.v_0_8_1)
}


export function handleWithdraw(event: Withdraw): void {
	ensureSyncMeta(event.block)
    let handler = new WithdrawHandler<Withdraw>()
    handler.handle(event, Version.v_0_8_1)
}
