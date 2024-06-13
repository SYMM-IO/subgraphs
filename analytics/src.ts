import { LiquidatePartyAHandler } from "./handlers/LiquidatePartyAHandler"
import {
	AcceptCancelCloseRequest,
	AcceptCancelRequest,
	AddSymbol,
	AllocateForPartyB,
	AllocatePartyA,
	ChargeFundingRate,
	DeallocateForPartyB,
	DeallocatePartyA,
	Deposit,
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
	LiquidationDisputed,
	LockQuote,
	OpenPosition,
	RequestToCancelCloseRequest,
	RequestToCancelQuote,
	RequestToClosePosition,
	RoleGranted,
	RoleRevoked,
	SendQuote,
	SetCollateral,
	SetSymbolsPrices,
	UnlockQuote,
	Withdraw,
} from "../generated/symmio/symmio"

import { DepositHandler } from "./handlers/DepositHandler"

import { ExpireQuoteHandler } from "./handlers/ExpireQuoteHandler"

import { WithdrawHandler } from "./handlers/WithdrawHandler"

import { AcceptCancelCloseRequestHandler } from "./handlers/AcceptCancelCloseRequestHandler"

import { EmergencyClosePositionHandler } from "./handlers/EmergencyClosePositionHandler"

import { RequestToCancelCloseRequestHandler } from "./handlers/RequestToCancelCloseRequestHandler"

import { OpenPositionHandler } from "./handlers/OpenPositionHandler"

import { ForceClosePositionHandler } from "./handlers/ForceClosePositionHandler"

import { LockQuoteHandler } from "./handlers/LockQuoteHandler"

import { SetSymbolsPricesHandler } from "./handlers/SetSymbolsPricesHandler"

import { LiquidatePendingPositionsPartyAHandler } from "./handlers/LiquidatePendingPositionsPartyAHandler"

import { FillCloseRequestHandler } from "./handlers/FillCloseRequestHandler"

import { LiquidatePartyBHandler } from "./handlers/LiquidatePartyBHandler"

import { RoleGrantedHandler } from "./handlers/RoleGrantedHandler"

import { DeallocatePartyAHandler } from "./handlers/DeallocatePartyAHandler"

import { ForceCancelQuoteHandler } from "./handlers/ForceCancelQuoteHandler"

import { UnlockQuoteHandler } from "./handlers/UnlockQuoteHandler"

import { LiquidatePositionsPartyBHandler } from "./handlers/LiquidatePositionsPartyBHandler"

import { RequestToCancelQuoteHandler } from "./handlers/RequestToCancelQuoteHandler"

import { AcceptCancelRequestHandler } from "./handlers/AcceptCancelRequestHandler"

import { ForceCancelCloseRequestHandler } from "./handlers/ForceCancelCloseRequestHandler"

import { RequestToClosePositionHandler } from "./handlers/RequestToClosePositionHandler"

import { ChargeFundingRateHandler } from "./handlers/ChargeFundingRateHandler"

import { RoleRevokedHandler } from "./handlers/RoleRevokedHandler"

import { LiquidatePositionsPartyAHandler } from "./handlers/LiquidatePositionsPartyAHandler"

import { SendQuoteHandler } from "./handlers/SendQuoteHandler"

import { LiquidationDisputedHandler } from "./handlers/LiquidationDisputedHandler"

import { AllocatePartyAHandler } from "./handlers/AllocatePartyAHandler"
import { AllocateForPartyBHandler } from "./handlers/AllocateForPartyBHandler"
import { DeallocateForPartyBHandler } from "./handlers/DeallocateForPartyBHandler"
import { SetCollateralHandler } from "./handlers/SetCollateralHandler"
import { AddSymbolHandler } from "./handlers/AddSymbolHandler"

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler(event)
	handler.handle()
}

export function handleDeposit(event: Deposit): void {
	let handler = new DepositHandler(event)
	handler.handle()
}

export function handleExpireQuote(event: ExpireQuote): void {
	let handler = new ExpireQuoteHandler(event)
	handler.handle()
}

export function handleWithdraw(event: Withdraw): void {
	let handler = new WithdrawHandler(event)
	handler.handle()
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler(event)
	handler.handle()
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler(event)
	handler.handle()
}

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler(event)
	handler.handle()
}

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	let handler = new EmergencyClosePositionHandler(event)
	handler.handle()
}

export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	let handler = new RequestToCancelCloseRequestHandler(event)
	handler.handle()
}

export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler(event)
	handler.handle()
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler(event)
	handler.handle()
}

export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler(event)
	handler.handle()
}

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	let handler = new SetSymbolsPricesHandler(event)
	handler.handle()
}

export function handleSetCollateral(event: SetCollateral): void {
	let handler = new SetCollateralHandler(event)
	handler.handle()
}

export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	let handler = new LiquidatePendingPositionsPartyAHandler(event)
	handler.handle()
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler(event)
	handler.handle()
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler(event)
	handler.handle()
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler(event)
	handler.handle()
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler(event)
	handler.handle()
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
	let handler = new ForceCancelQuoteHandler(event)
	handler.handle()
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler(event)
	handler.handle()
}

export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	let handler = new LiquidatePositionsPartyBHandler(event)
	handler.handle()
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	let handler = new RequestToCancelQuoteHandler(event)
	handler.handle()
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler(event)
	handler.handle()
}

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	let handler = new ForceCancelCloseRequestHandler(event)
	handler.handle()
}

export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	let handler = new RequestToClosePositionHandler(event)
	handler.handle()
}

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	let handler = new ChargeFundingRateHandler(event)
	handler.handle()
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler(event)
	handler.handle()
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler(event)
	handler.handle()
}

export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler(event)
	handler.handle()
}

export function handleLiquidationDisputed(event: LiquidationDisputed): void {
	let handler = new LiquidationDisputedHandler(event)
	handler.handle()
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler(event)
	handler.handle()
}

export function handleAddSymbol(event: AddSymbol): void {
	let handler = new AddSymbolHandler(event)
	handler.handle()
}
		
		