import {SetSymbolsPricesHandler} from "./handlers/SetSymbolsPricesHandler"
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
	SetSymbolsPrices,
	UnlockQuote
} from "../generated/symmio_0_8_2/symmio_0_8_2"

import {AcceptCancelCloseRequestHandler} from "./handlers/AcceptCancelCloseRequestHandler"

import {LiquidatePositionsPartyAHandler} from "./handlers/LiquidatePositionsPartyAHandler"

import {ForceCancelQuoteHandler} from "./handlers/ForceCancelQuoteHandler"

import {ForceClosePositionHandler} from "./handlers/ForceClosePositionHandler"

import {ChargeFundingRateHandler} from "./handlers/ChargeFundingRateHandler"

import {RequestToClosePositionHandler} from "./handlers/RequestToClosePositionHandler"

import {LiquidatePositionsPartyBHandler} from "./handlers/LiquidatePositionsPartyBHandler"

import {ExpireQuoteHandler} from "./handlers/ExpireQuoteHandler"

import {RequestToCancelQuoteHandler} from "./handlers/RequestToCancelQuoteHandler"

import {LockQuoteHandler} from "./handlers/LockQuoteHandler"

import {FillCloseRequestHandler} from "./handlers/FillCloseRequestHandler"

import {AcceptCancelRequestHandler} from "./handlers/AcceptCancelRequestHandler"

import {SendQuoteHandler} from "./handlers/SendQuoteHandler"

import {UnlockQuoteHandler} from "./handlers/UnlockQuoteHandler"

import {LiquidatePartyBHandler} from "./handlers/LiquidatePartyBHandler"

import {OpenPositionHandler} from "./handlers/OpenPositionHandler"

import {ForceCancelCloseRequestHandler} from "./handlers/ForceCancelCloseRequestHandler"

import {LiquidatePendingPositionsPartyAHandler} from "./handlers/LiquidatePendingPositionsPartyAHandler"

import {RequestToCancelCloseRequestHandler} from "./handlers/RequestToCancelCloseRequestHandler"

import {EmergencyClosePositionHandler} from "./handlers/EmergencyClosePositionHandler"


import {Version} from "../common/BaseHandler"

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
	let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler<ForceClosePosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	let handler = new RequestToClosePositionHandler<RequestToClosePosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	let handler = new LiquidatePositionsPartyBHandler<LiquidatePositionsPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleExpireQuote(event: ExpireQuote): void {
	let handler = new ExpireQuoteHandler<ExpireQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler<LockQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler<FillCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler<SendQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler<UnlockQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler<OpenPosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
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
        