import {AcceptCancelCloseRequestHandler} from "./handlers/symmio/AcceptCancelCloseRequestHandler"
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
	LiquidatePartyB,
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
	Withdraw
} from "../generated/symmio_0_8_2/symmio_0_8_2"

import {SendQuoteHandler} from "./handlers/symmio/SendQuoteHandler"

import {WithdrawHandler} from "./handlers/symmio/WithdrawHandler"

import {DeallocatePartyAHandler} from "./handlers/symmio/DeallocatePartyAHandler"

import {SetCollateralHandler} from "./handlers/symmio/SetCollateralHandler"

import {RequestToClosePositionHandler} from "./handlers/symmio/RequestToClosePositionHandler"

import {LiquidatePositionsPartyBHandler} from "./handlers/symmio/LiquidatePositionsPartyBHandler"

import {ChargeFundingRateHandler} from "./handlers/symmio/ChargeFundingRateHandler"

import {ForceCancelCloseRequestHandler} from "./handlers/symmio/ForceCancelCloseRequestHandler"

import {ForceClosePositionHandler} from "./handlers/symmio/ForceClosePositionHandler"

import {AddSymbolHandler} from "./handlers/symmio/AddSymbolHandler"

import {RequestToCancelCloseRequestHandler} from "./handlers/symmio/RequestToCancelCloseRequestHandler"

import {ForceCancelQuoteHandler} from "./handlers/symmio/ForceCancelQuoteHandler"

import {UnlockQuoteHandler} from "./handlers/symmio/UnlockQuoteHandler"

import {AllocatePartyAHandler} from "./handlers/symmio/AllocatePartyAHandler"

import {LockQuoteHandler} from "./handlers/symmio/LockQuoteHandler"

import {EmergencyClosePositionHandler} from "./handlers/symmio/EmergencyClosePositionHandler"

import {RequestToCancelQuoteHandler} from "./handlers/symmio/RequestToCancelQuoteHandler"

import {RoleGrantedHandler} from "./handlers/symmio/RoleGrantedHandler"

import {SetSymbolsPricesHandler} from "./handlers/symmio/SetSymbolsPricesHandler"

import {LiquidationDisputedHandler} from "./handlers/symmio/LiquidationDisputedHandler"

import {LiquidatePositionsPartyAHandler} from "./handlers/symmio/LiquidatePositionsPartyAHandler"

import {ExpireQuoteHandler} from "./handlers/symmio/ExpireQuoteHandler"

import {DepositHandler} from "./handlers/symmio/DepositHandler"

import {RoleRevokedHandler} from "./handlers/symmio/RoleRevokedHandler"

import {LiquidatePartyBHandler} from "./handlers/symmio/LiquidatePartyBHandler"

import {DeallocateForPartyBHandler} from "./handlers/symmio/DeallocateForPartyBHandler"

import {AcceptCancelRequestHandler} from "./handlers/symmio/AcceptCancelRequestHandler"

import {OpenPositionHandler} from "./handlers/symmio/OpenPositionHandler"

import {AllocateForPartyBHandler} from "./handlers/symmio/AllocateForPartyBHandler"

import {FillCloseRequestHandler} from "./handlers/symmio/FillCloseRequestHandler"


import {Version} from "../common/BaseHandler"

export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler<AcceptCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler<SendQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleWithdraw(event: Withdraw): void {
	let handler = new WithdrawHandler<Withdraw>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetCollateral(event: SetCollateral): void {
	let handler = new SetCollateralHandler<SetCollateral>()
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

export function handleChargeFundingRate(event: ChargeFundingRate): void {
	let handler = new ChargeFundingRateHandler<ChargeFundingRate>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
	let handler = new ForceCancelCloseRequestHandler<ForceCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler<ForceClosePosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAddSymbol(event: AddSymbol): void {
	let handler = new AddSymbolHandler<AddSymbol>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
	let handler = new RequestToCancelCloseRequestHandler<RequestToCancelCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleForceCancelQuote(event: ForceCancelQuote): void {
	let handler = new ForceCancelQuoteHandler<ForceCancelQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler<UnlockQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler<AllocatePartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler<LockQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	let handler = new EmergencyClosePositionHandler<EmergencyClosePosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
	let handler = new RequestToCancelQuoteHandler<RequestToCancelQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidationDisputed(event: LiquidationDisputed): void {
	let handler = new LiquidationDisputedHandler<LiquidationDisputed>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler<LiquidatePositionsPartyA>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleExpireQuote(event: ExpireQuote): void {
	let handler = new ExpireQuoteHandler<ExpireQuote>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeposit(event: Deposit): void {
	let handler = new DepositHandler<Deposit>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler<AcceptCancelRequest>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler<OpenPosition>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
	handler.handle(event, Version.v_0_8_2)
}

export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler<FillCloseRequest>()
	handler.handle(event, Version.v_0_8_2)
}
        