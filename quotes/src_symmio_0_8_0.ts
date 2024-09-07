import { AcceptCancelCloseRequestHandler } from './handlers/symmio/AcceptCancelCloseRequestHandler'
import { AcceptCancelCloseRequest } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { AcceptCancelRequestHandler } from './handlers/symmio/AcceptCancelRequestHandler'
import { AcceptCancelRequest } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { EmergencyClosePositionHandler } from './handlers/symmio/EmergencyClosePositionHandler'
import { EmergencyClosePosition } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { ExpireQuoteHandler } from './handlers/symmio/ExpireQuoteHandler'
import { ExpireQuote } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { FillCloseRequestHandler } from './handlers/symmio/FillCloseRequestHandler'
import { FillCloseRequest } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { ForceCancelCloseRequestHandler } from './handlers/symmio/ForceCancelCloseRequestHandler'
import { ForceCancelCloseRequest } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { ForceCancelQuoteHandler } from './handlers/symmio/ForceCancelQuoteHandler'
import { ForceCancelQuote } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { ForceClosePositionHandler } from './handlers/symmio/ForceClosePositionHandler'
import { ForceClosePosition } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { LiquidatePartyBHandler } from './handlers/symmio/LiquidatePartyBHandler'
import { LiquidatePartyB } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { LiquidatePositionsPartyAHandler } from './handlers/symmio/LiquidatePositionsPartyAHandler'
import { LiquidatePositionsPartyA } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { LiquidatePositionsPartyBHandler } from './handlers/symmio/LiquidatePositionsPartyBHandler'
import { LiquidatePositionsPartyB } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { LockQuoteHandler } from './handlers/symmio/LockQuoteHandler'
import { LockQuote } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { OpenPositionHandler } from './handlers/symmio/OpenPositionHandler'
import { OpenPosition } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { RequestToCancelCloseRequestHandler } from './handlers/symmio/RequestToCancelCloseRequestHandler'
import { RequestToCancelCloseRequest } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { RequestToCancelQuoteHandler } from './handlers/symmio/RequestToCancelQuoteHandler'
import { RequestToCancelQuote } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { RequestToClosePositionHandler } from './handlers/symmio/RequestToClosePositionHandler'
import { RequestToClosePosition } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { SendQuoteHandler } from './handlers/symmio/SendQuoteHandler'
import { SendQuote } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { UnlockQuoteHandler } from './handlers/symmio/UnlockQuoteHandler'
import { UnlockQuote } from '../generated/symmio_0_8_0/symmio_0_8_0'
import { Version } from '../common/BaseHandler'


export function handleExpireQuote(event: ExpireQuote): void {
    // let handler = new ExpireQuoteHandler<ExpireQuote>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
    // let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
    // let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
    // let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleForceCancelQuote(event: ForceCancelQuote): void {
    // let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleSendQuote(event: SendQuote): void {
    // let handler = new SendQuoteHandler<SendQuote>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleRequestToClosePosition(event: RequestToClosePosition): void {
    // let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    // let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
    // let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
    // let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
    // let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleForceClosePosition(event: ForceClosePosition): void {
    // let handler = new ForceClosePositionHandler<ForceClosePosition>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleLockQuote(event: LockQuote): void {
    // let handler = new LockQuoteHandler<LockQuote>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleUnlockQuote(event: UnlockQuote): void {
    // let handler = new UnlockQuoteHandler<UnlockQuote>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleOpenPosition(event: OpenPosition): void {
    // let handler = new OpenPositionHandler<OpenPosition>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    // let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    // let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
    // handler.handle(event, Version.v_0_8_0)
}


export function handleFillCloseRequest(event: FillCloseRequest): void {
    // let handler = new FillCloseRequestHandler<FillCloseRequest>()
    // handler.handle(event, Version.v_0_8_0)
}
