import {AcceptCancelCloseRequestHandler} from './handlers/symmio/AcceptCancelCloseRequestHandler'
import {AcceptCancelCloseRequest} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {AcceptCancelRequestHandler} from './handlers/symmio/AcceptCancelRequestHandler'
import {AcceptCancelRequest} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {ChargeFundingRateHandler} from './handlers/symmio/ChargeFundingRateHandler'
import {ChargeFundingRate} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {EmergencyClosePositionHandler} from './handlers/symmio/EmergencyClosePositionHandler'
import {EmergencyClosePosition} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {ExpireQuoteHandler} from './handlers/symmio/ExpireQuoteHandler'
import {ExpireQuote} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {FillCloseRequestHandler} from './handlers/symmio/FillCloseRequestHandler'
import {FillCloseRequest} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {ForceCancelCloseRequestHandler} from './handlers/symmio/ForceCancelCloseRequestHandler'
import {ForceCancelCloseRequest} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {ForceCancelQuoteHandler} from './handlers/symmio/ForceCancelQuoteHandler'
import {ForceCancelQuote} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {ForceClosePositionHandler} from './handlers/symmio/ForceClosePositionHandler'
import {ForceClosePosition} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {LiquidatePendingPositionsPartyAHandler} from './handlers/symmio/LiquidatePendingPositionsPartyAHandler'
import {LiquidatePendingPositionsPartyA} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {LiquidatePositionsPartyAHandler} from './handlers/symmio/LiquidatePositionsPartyAHandler'
import {LiquidatePositionsPartyA} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {LiquidatePositionsPartyBHandler} from './handlers/symmio/LiquidatePositionsPartyBHandler'
import {LiquidatePositionsPartyB} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {LockQuoteHandler} from './handlers/symmio/LockQuoteHandler'
import {LockQuote} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {OpenPositionHandler} from './handlers/symmio/OpenPositionHandler'
import {OpenPosition} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {RequestToCancelCloseRequestHandler} from './handlers/symmio/RequestToCancelCloseRequestHandler'
import {RequestToCancelCloseRequest} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {RequestToCancelQuoteHandler} from './handlers/symmio/RequestToCancelQuoteHandler'
import {RequestToCancelQuote} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {RequestToClosePositionHandler} from './handlers/symmio/RequestToClosePositionHandler'
import {RequestToClosePosition} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {SendQuoteHandler} from './handlers/symmio/SendQuoteHandler'
import {SendQuote} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SetSymbolsPrices} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {UnlockQuoteHandler} from './handlers/symmio/UnlockQuoteHandler'
import {UnlockQuote} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {Version} from '../common/BaseHandler'


export function handleExpireQuote(event: ExpireQuote): void {
    let handler = new ExpireQuoteHandler<ExpireQuote>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleChargeFundingRate(event: ChargeFundingRate): void {
    let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
    let handler = new LiquidatePendingPositionsPartyAHandler<LiquidatePendingPositionsPartyA>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
    let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleForceCancelQuote(event: ForceCancelQuote): void {
    let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleSendQuote(event: SendQuote): void {
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
    let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
    let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
    let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
    let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleForceClosePosition(event: ForceClosePosition): void {
    let handler = new ForceClosePositionHandler<ForceClosePosition>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleLockQuote(event: LockQuote): void {
    let handler = new LockQuoteHandler<LockQuote>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleUnlockQuote(event: UnlockQuote): void {
    let handler = new UnlockQuoteHandler<UnlockQuote>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleOpenPosition(event: OpenPosition): void {
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleFillCloseRequest(event: FillCloseRequest): void {
    let handler = new FillCloseRequestHandler<FillCloseRequest>()
    handler.handle(event, Version.v_0_8_2)
}
        