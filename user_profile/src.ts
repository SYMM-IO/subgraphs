
import {WithdrawHandler} from "./handlers/WithdrawHandler"
import {Withdraw} from "../generated/symmio/symmio"
		
import {AcceptCancelRequestHandler} from "./handlers/AcceptCancelRequestHandler"
import {AcceptCancelRequest} from "../generated/symmio/symmio"
		
import {LockQuoteHandler} from "./handlers/LockQuoteHandler"
import {LockQuote} from "../generated/symmio/symmio"
		
import {ExpireQuoteHandler} from "./handlers/ExpireQuoteHandler"
import {ExpireQuote} from "../generated/symmio/symmio"
		
import {AllocatePartyBHandler} from "./handlers/AllocatePartyBHandler"
import {AllocatePartyB} from "../generated/symmio/symmio"
		
import {AddSymbolHandler} from "./handlers/AddSymbolHandler"
import {AddSymbol} from "../generated/symmio/symmio"
		
import {EmergencyClosePositionHandler} from "./handlers/EmergencyClosePositionHandler"
import {EmergencyClosePosition} from "../generated/symmio/symmio"
		
import {AcceptCancelCloseRequestHandler} from "./handlers/AcceptCancelCloseRequestHandler"
import {AcceptCancelCloseRequest} from "../generated/symmio/symmio"
		
import {AllocateForPartyBHandler} from "./handlers/AllocateForPartyBHandler"
import {AllocateForPartyB} from "../generated/symmio/symmio"
		
import {DeallocatePartyAHandler} from "./handlers/DeallocatePartyAHandler"
import {DeallocatePartyA} from "../generated/symmio/symmio"
		
import {SetCollateralHandler} from "./handlers/SetCollateralHandler"
import {SetCollateral} from "../generated/symmio/symmio"
		
import {DeallocateForPartyBHandler} from "./handlers/DeallocateForPartyBHandler"
import {DeallocateForPartyB} from "../generated/symmio/symmio"
		
import {SendQuoteHandler} from "./handlers/SendQuoteHandler"
import {SendQuote} from "../generated/symmio/symmio"
		
import {OpenPositionHandler} from "./handlers/OpenPositionHandler"
import {OpenPosition} from "../generated/symmio/symmio"
		
import {AllocatePartyAHandler} from "./handlers/AllocatePartyAHandler"
import {AllocatePartyA} from "../generated/symmio/symmio"
		
import {DepositHandler} from "./handlers/DepositHandler"
import {Deposit} from "../generated/symmio/symmio"
		
import {FillCloseRequestHandler} from "./handlers/FillCloseRequestHandler"
import {FillCloseRequest} from "../generated/symmio/symmio"
		
import {LiquidatePositionsPartyAHandler} from "./handlers/LiquidatePositionsPartyAHandler"
import {LiquidatePositionsPartyA} from "../generated/symmio/symmio"
		
import {ChargeFundingRateHandler} from "./handlers/ChargeFundingRateHandler"
import {ChargeFundingRate} from "../generated/symmio/symmio"
		
import {LiquidatePositionsPartyBHandler} from "./handlers/LiquidatePositionsPartyBHandler"
import {LiquidatePositionsPartyB} from "../generated/symmio/symmio"
		
import {SetSymbolTradingFeeHandler} from "./handlers/SetSymbolTradingFeeHandler"
import {SetSymbolTradingFee} from "../generated/symmio/symmio"
		
import {UnlockQuoteHandler} from "./handlers/UnlockQuoteHandler"
import {UnlockQuote} from "../generated/symmio/symmio"
		
import {ForceClosePositionHandler} from "./handlers/ForceClosePositionHandler"
import {ForceClosePosition} from "../generated/symmio/symmio"
		
import {RequestToClosePositionHandler} from "./handlers/RequestToClosePositionHandler"
import {RequestToClosePosition} from "../generated/symmio/symmio"
		
export function handleWithdraw(event: Withdraw): void {
	let handler = new WithdrawHandler(event)
	handler.handle()
}
		
export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
	let handler = new AcceptCancelRequestHandler(event)
	handler.handle()
}
		
export function handleLockQuote(event: LockQuote): void {
	let handler = new LockQuoteHandler(event)
	handler.handle()
}
		
export function handleExpireQuote(event: ExpireQuote): void {
	let handler = new ExpireQuoteHandler(event)
	handler.handle()
}
		
export function handleAllocatePartyB(event: AllocatePartyB): void {
	let handler = new AllocatePartyBHandler(event)
	handler.handle()
}
		
export function handleAddSymbol(event: AddSymbol): void {
	let handler = new AddSymbolHandler(event)
	handler.handle()
}
		
export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
	let handler = new EmergencyClosePositionHandler(event)
	handler.handle()
}
		
export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
	let handler = new AcceptCancelCloseRequestHandler(event)
	handler.handle()
}
		
export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler(event)
	handler.handle()
}
		
export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler(event)
	handler.handle()
}
		
export function handleSetCollateral(event: SetCollateral): void {
	let handler = new SetCollateralHandler(event)
	handler.handle()
}
		
export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler(event)
	handler.handle()
}
		
export function handleSendQuote(event: SendQuote): void {
	let handler = new SendQuoteHandler(event)
	handler.handle()
}
		
export function handleOpenPosition(event: OpenPosition): void {
	let handler = new OpenPositionHandler(event)
	handler.handle()
}
		
export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler(event)
	handler.handle()
}
		
export function handleDeposit(event: Deposit): void {
	let handler = new DepositHandler(event)
	handler.handle()
}
		
export function handleFillCloseRequest(event: FillCloseRequest): void {
	let handler = new FillCloseRequestHandler(event)
	handler.handle()
}
		
export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
	let handler = new LiquidatePositionsPartyAHandler(event)
	handler.handle()
}
		
export function handleChargeFundingRate(event: ChargeFundingRate): void {
	let handler = new ChargeFundingRateHandler(event)
	handler.handle()
}
		
export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
	let handler = new LiquidatePositionsPartyBHandler(event)
	handler.handle()
}
		
export function handleSetSymbolTradingFee(event: SetSymbolTradingFee): void {
	let handler = new SetSymbolTradingFeeHandler(event)
	handler.handle()
}
		
export function handleUnlockQuote(event: UnlockQuote): void {
	let handler = new UnlockQuoteHandler(event)
	handler.handle()
}
		
export function handleForceClosePosition(event: ForceClosePosition): void {
	let handler = new ForceClosePositionHandler(event)
	handler.handle()
}
		
export function handleRequestToClosePosition(event: RequestToClosePosition): void {
	let handler = new RequestToClosePositionHandler(event)
	handler.handle()
}
		