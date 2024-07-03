
import {LiquidatePositionsPartyBHandler} from "./handlers/LiquidatePositionsPartyBHandler"
import {LiquidatePositionsPartyB} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {WithdrawHandler} from "./handlers/WithdrawHandler"
import {Withdraw} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {LiquidatePositionsPartyAHandler} from "./handlers/LiquidatePositionsPartyAHandler"
import {LiquidatePositionsPartyA} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {ForceCancelQuoteHandler} from "./handlers/ForceCancelQuoteHandler"
import {ForceCancelQuote} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {ForceCancelCloseRequestHandler} from "./handlers/ForceCancelCloseRequestHandler"
import {ForceCancelCloseRequest} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {AllocateForPartyBHandler} from "./handlers/AllocateForPartyBHandler"
import {AllocateForPartyB} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {RequestToCancelQuoteHandler} from "./handlers/RequestToCancelQuoteHandler"
import {RequestToCancelQuote} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {OpenPositionHandler} from "./handlers/OpenPositionHandler"
import {OpenPosition} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {SetCollateralHandler} from "./handlers/SetCollateralHandler"
import {SetCollateral} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {AcceptCancelCloseRequestHandler} from "./handlers/AcceptCancelCloseRequestHandler"
import {AcceptCancelCloseRequest} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {UnlockQuoteHandler} from "./handlers/UnlockQuoteHandler"
import {UnlockQuote} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {RoleRevokedHandler} from "./handlers/RoleRevokedHandler"
import {RoleRevoked} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {AddSymbolHandler} from "./handlers/AddSymbolHandler"
import {AddSymbol} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {AcceptCancelRequestHandler} from "./handlers/AcceptCancelRequestHandler"
import {AcceptCancelRequest} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {ExpireQuoteHandler} from "./handlers/ExpireQuoteHandler"
import {ExpireQuote} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {AllocatePartyAHandler} from "./handlers/AllocatePartyAHandler"
import {AllocatePartyA} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {RoleGrantedHandler} from "./handlers/RoleGrantedHandler"
import {RoleGranted} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {SendQuoteHandler} from "./handlers/SendQuoteHandler"
import {SendQuote} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {DeallocatePartyAHandler} from "./handlers/DeallocatePartyAHandler"
import {DeallocatePartyA} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {RequestToCancelCloseRequestHandler} from "./handlers/RequestToCancelCloseRequestHandler"
import {RequestToCancelCloseRequest} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {ForceClosePositionHandler} from "./handlers/ForceClosePositionHandler"
import {ForceClosePosition} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {DepositHandler} from "./handlers/DepositHandler"
import {Deposit} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {LockQuoteHandler} from "./handlers/LockQuoteHandler"
import {LockQuote} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {RequestToClosePositionHandler} from "./handlers/RequestToClosePositionHandler"
import {RequestToClosePosition} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {EmergencyClosePositionHandler} from "./handlers/EmergencyClosePositionHandler"
import {EmergencyClosePosition} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {FillCloseRequestHandler} from "./handlers/FillCloseRequestHandler"
import {FillCloseRequest} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {LiquidatePartyBHandler} from "./handlers/LiquidatePartyBHandler"
import {LiquidatePartyB} from "../generated/symmio_0_8_0/symmio_0_8_0" 
import {DeallocateForPartyBHandler} from "./handlers/DeallocateForPartyBHandler"
import {DeallocateForPartyB} from "../generated/symmio_0_8_0/symmio_0_8_0" 


export function handleLiquidatePositionsPartyB(event: LiquidatePositionsPartyB): void {
    let handler = new LiquidatePositionsPartyBHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleWithdraw(event: Withdraw): void {
    let handler = new WithdrawHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleLiquidatePositionsPartyA(event: LiquidatePositionsPartyA): void {
    let handler = new LiquidatePositionsPartyAHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleForceCancelQuote(event: ForceCancelQuote): void {
    let handler = new ForceCancelQuoteHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleForceCancelCloseRequest(event: ForceCancelCloseRequest): void {
    let handler = new ForceCancelCloseRequestHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleAllocateForPartyB(event: AllocateForPartyB): void {
    let handler = new AllocateForPartyBHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleRequestToCancelQuote(event: RequestToCancelQuote): void {
    let handler = new RequestToCancelQuoteHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleOpenPosition(event: OpenPosition): void {
    let handler = new OpenPositionHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleSetCollateral(event: SetCollateral): void {
    let handler = new SetCollateralHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleAcceptCancelCloseRequest(event: AcceptCancelCloseRequest): void {
    let handler = new AcceptCancelCloseRequestHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleUnlockQuote(event: UnlockQuote): void {
    let handler = new UnlockQuoteHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleRoleRevoked(event: RoleRevoked): void {
    let handler = new RoleRevokedHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleAddSymbol(event: AddSymbol): void {
    let handler = new AddSymbolHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleAcceptCancelRequest(event: AcceptCancelRequest): void {
    let handler = new AcceptCancelRequestHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleExpireQuote(event: ExpireQuote): void {
    let handler = new ExpireQuoteHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleAllocatePartyA(event: AllocatePartyA): void {
    let handler = new AllocatePartyAHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleRoleGranted(event: RoleGranted): void {
    let handler = new RoleGrantedHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleSendQuote(event: SendQuote): void {
    let handler = new SendQuoteHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleDeallocatePartyA(event: DeallocatePartyA): void {
    let handler = new DeallocatePartyAHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleRequestToCancelCloseRequest(event: RequestToCancelCloseRequest): void {
    let handler = new RequestToCancelCloseRequestHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleForceClosePosition(event: ForceClosePosition): void {
    let handler = new ForceClosePositionHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleDeposit(event: Deposit): void {
    let handler = new DepositHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleLockQuote(event: LockQuote): void {
    let handler = new LockQuoteHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleRequestToClosePosition(event: RequestToClosePosition): void {
    let handler = new RequestToClosePositionHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleEmergencyClosePosition(event: EmergencyClosePosition): void {
    let handler = new EmergencyClosePositionHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleFillCloseRequest(event: FillCloseRequest): void {
    let handler = new FillCloseRequestHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    let handler = new LiquidatePartyBHandler(event, "0_8_0")
    handler.handle()
}
        
export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
    let handler = new DeallocateForPartyBHandler(event, "0_8_0")
    handler.handle()
}
        