import { AcceptCancelCloseRequest1 } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { AcceptCancelCloseRequestHandler } from './handlers/symmio/AcceptCancelCloseRequestHandler'
import { AcceptCancelCloseRequest } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { AcceptCancelRequestHandler } from './handlers/symmio/AcceptCancelRequestHandler'
import { AcceptCancelRequest } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { ChargeFundingRateHandler } from './handlers/symmio/ChargeFundingRateHandler'
import { ChargeFundingRate } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { EmergencyClosePosition1 } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { EmergencyClosePositionHandler } from './handlers/symmio/EmergencyClosePositionHandler'
import { EmergencyClosePosition } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { ExpireQuoteHandler } from './handlers/symmio/ExpireQuoteHandler'
import { ExpireQuote } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { FillCloseRequest1 } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { FillCloseRequestHandler } from './handlers/symmio/FillCloseRequestHandler'
import { FillCloseRequest } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { ForceClosePosition1 } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { ForceClosePositionHandler } from './handlers/symmio/ForceClosePositionHandler'
import { ForceClosePosition } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { LiquidatePositionsPartyA1 } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { LiquidatePositionsPartyAHandler } from './handlers/symmio/LiquidatePositionsPartyAHandler'
import { LiquidatePositionsPartyA } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { LiquidatePositionsPartyB1 } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { LiquidatePositionsPartyBHandler } from './handlers/symmio/LiquidatePositionsPartyBHandler'
import { LiquidatePositionsPartyB } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { LockQuoteHandler } from './handlers/symmio/LockQuoteHandler'
import { LockQuote } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { OpenPositionHandler } from './handlers/symmio/OpenPositionHandler'
import { OpenPosition } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { RequestToClosePosition1 } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { RequestToClosePositionHandler } from './handlers/symmio/RequestToClosePositionHandler'
import { RequestToClosePosition } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { SendQuoteHandler } from './handlers/symmio/SendQuoteHandler'
import { SendQuote } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { UnlockQuoteHandler } from './handlers/symmio/UnlockQuoteHandler'
import { UnlockQuote } from '../generated/symmio_0_8_3/symmio_0_8_3'
import { Version } from '../common/BaseHandler'


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
    let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleOpenPosition(event: OpenPosition): void {
    let handler = new OpenPositionHandler<OpenPosition>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleEmergencyClosePosition1(event: EmergencyClosePosition1): void {
    let handler = new EmergencyClosePositionHandler<EmergencyClosePosition1>()
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


export function handleFillCloseRequest1(event: FillCloseRequest1): void {
    let handler = new FillCloseRequestHandler<FillCloseRequest1>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleLiquidatePositionsPartyB1(event: LiquidatePositionsPartyB1): void {
    let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB1>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleUnlockQuote(event: UnlockQuote): void {
    let handler = new UnlockQuoteHandler<UnlockQuote>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleLockQuote(event: LockQuote): void {
    let handler = new LockQuoteHandler<LockQuote>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleSendQuote(event: SendQuote): void {
    let handler = new SendQuoteHandler<SendQuote>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleAcceptCancelCloseRequest1(event: AcceptCancelCloseRequest1): void {
    let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest1>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleRequestToClosePosition(event: RequestToClosePosition): void {
    event.params.
    let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleRequestToClosePosition1(event: RequestToClosePosition1): void {
    let handler = new RequestToClosePositionHandler<RequestToClosePosition1>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleForceClosePosition(event: ForceClosePosition): void {
    let handler = new ForceClosePositionHandler<ForceClosePosition>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleForceClosePosition1(event: ForceClosePosition1): void {
    let handler = new ForceClosePositionHandler<ForceClosePosition1>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleChargeFundingRate(event: ChargeFundingRate): void {
    let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    handler.handle(event, Version.v_0_8_3)
}


export function handleLiquidatePositionsPartyA1(event: LiquidatePositionsPartyA1): void {
    let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA1>()
    handler.handle(event, Version.v_0_8_3)
}
