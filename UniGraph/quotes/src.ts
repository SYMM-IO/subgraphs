import { LiquidatePositionsPartyBHandler } from "./handlers/LiquidatePositionsPartyBHandler"
import {
	AcceptCancelCloseRequest,
	AcceptCancelRequest,
	ChargeFundingRate,
	EmergencyClosePosition,
	ExpireQuote,
	FillCloseRequest,
	ForceCancelCloseRequest,
	ForceCancelQuote,
	ForceClosePosition,
	LiquidatePartyA,
	LiquidatePartyB,
	LiquidatePendingPositionsPartyA,
	LiquidatePositionsPartyA,
	LiquidatePositionsPartyB,
	LockQuote,
	OpenPosition,
	RequestToCancelCloseRequest,
	RequestToCancelQuote,
	RequestToClosePosition,
	SendQuote,
	UnlockQuote,
} from "../generated/symmio/symmio"

import { AcceptCancelCloseRequestHandler } from "./handlers/AcceptCancelCloseRequestHandler"

import { ForceCancelCloseRequestHandler } from "./handlers/ForceCancelCloseRequestHandler"

import { LiquidatePositionsPartyAHandler } from "./handlers/LiquidatePositionsPartyAHandler"

import { RequestToCancelCloseRequestHandler } from "./handlers/RequestToCancelCloseRequestHandler"

import { ForceCancelQuoteHandler } from "./handlers/ForceCancelQuoteHandler"

import { OpenPositionHandler } from "./handlers/OpenPositionHandler"

import { LockQuoteHandler } from "./handlers/LockQuoteHandler"

import { FillCloseRequestHandler } from "./handlers/FillCloseRequestHandler"

import { EmergencyClosePositionHandler } from "./handlers/EmergencyClosePositionHandler"

import { AcceptCancelRequestHandler } from "./handlers/AcceptCancelRequestHandler"

import { LiquidatePendingPositionsPartyAHandler } from "./handlers/LiquidatePendingPositionsPartyAHandler"

import { ChargeFundingRateHandler } from "./handlers/ChargeFundingRateHandler"

import { ForceClosePositionHandler } from "./handlers/ForceClosePositionHandler"

import { LiquidatePartyBHandler } from "./handlers/LiquidatePartyBHandler"

import { ExpireQuoteHandler } from "./handlers/ExpireQuoteHandler"

import { SendQuoteHandler } from "./handlers/SendQuoteHandler"

import { UnlockQuoteHandler } from "./handlers/UnlockQuoteHandler"

import { LiquidatePartyAHandler } from "./handlers/LiquidatePartyAHandler"

import { RequestToCancelQuoteHandler } from "./handlers/RequestToCancelQuoteHandler"

import { RequestToClosePositionHandler } from "./handlers/RequestToClosePositionHandler"

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	let handler = new LiquidatePositionsPartyBHandler(event)
	handler.handle()
}

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler(event)
	handler.handle()
}

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	let handler = new ForceCancelCloseRequestHandler(event)
	handler.handle()
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler(event)
	handler.handle()
}

export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	let handler = new RequestToCancelCloseRequestHandler(event)
	handler.handle()
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
	let handler = new ForceCancelQuoteHandler(event)
	handler.handle()
}

export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler(event)
	handler.handle()
}

export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler(event)
	handler.handle()
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler(event)
	handler.handle()
}

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	let handler = new EmergencyClosePositionHandler(event)
	handler.handle()
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler(event)
	handler.handle()
}

export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	let handler = new LiquidatePendingPositionsPartyAHandler(event)
	handler.handle()
}

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	let handler = new ChargeFundingRateHandler(event)
	handler.handle()
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler(event)
	handler.handle()
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler(event)
	handler.handle()
}

export function handleExpireQuote(event: ExpireQuote): void {
	let handler = new ExpireQuoteHandler(event)
	handler.handle()
}

export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler(event)
	handler.handle()
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler(event)
	handler.handle()
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler(event)
	handler.handle()
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	let handler = new RequestToCancelQuoteHandler(event)
	handler.handle()
}

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	let handler = new RequestToClosePositionHandler(event)
	handler.handle()
}
		