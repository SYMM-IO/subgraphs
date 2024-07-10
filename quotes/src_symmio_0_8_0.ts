import {FillCloseRequestHandler} from "./handlers/symmio/FillCloseRequestHandler"
import {
	AcceptCancelCloseRequest,
	AcceptCancelRequest,
	EmergencyClosePosition,
	ExpireQuote,
	FillCloseRequest,
	ForceClosePosition,
	LiquidatePositionsPartyA,
	LiquidatePositionsPartyB,
	LockQuote,
	OpenPosition,
	RequestToClosePosition,
	SendQuote,
	UnlockQuote
} from "../generated/symmio_0_8_0/symmio_0_8_0"

import {LockQuoteHandler} from "./handlers/symmio/LockQuoteHandler"

import {SendQuoteHandler} from "./handlers/symmio/SendQuoteHandler"

import {ExpireQuoteHandler} from "./handlers/symmio/ExpireQuoteHandler"

import {OpenPositionHandler} from "./handlers/symmio/OpenPositionHandler"

import {LiquidatePositionsPartyBHandler} from "./handlers/symmio/LiquidatePositionsPartyBHandler"

import {AcceptCancelRequestHandler} from "./handlers/symmio/AcceptCancelRequestHandler"

import {AcceptCancelCloseRequestHandler} from "./handlers/symmio/AcceptCancelCloseRequestHandler"

import {EmergencyClosePositionHandler} from "./handlers/symmio/EmergencyClosePositionHandler"

import {LiquidatePositionsPartyAHandler} from "./handlers/symmio/LiquidatePositionsPartyAHandler"

import {RequestToClosePositionHandler} from "./handlers/symmio/RequestToClosePositionHandler"

import {ForceClosePositionHandler} from "./handlers/symmio/ForceClosePositionHandler"

import {UnlockQuoteHandler} from "./handlers/symmio/UnlockQuoteHandler"


import {Version} from "../common/BaseHandler"

export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler<FillCloseRequest>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler<LockQuote>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler<SendQuote>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleExpireQuote(event: ExpireQuote): void {
	let handler = new ExpireQuoteHandler<ExpireQuote>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler<OpenPosition>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler<ForceClosePosition>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler<UnlockQuote>()
	handler.handle(event, Version.v_0_8_0)
}
        