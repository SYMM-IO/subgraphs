
import {LiquidatePartyAHandler} from "./handlers/LiquidatePartyAHandler"
import {LiquidatePartyA} from "../generated/symmio/symmio"
		
import {LiquidatePartyBHandler} from "./handlers/LiquidatePartyBHandler"
import {LiquidatePartyB} from "../generated/symmio/symmio"
		
import {DeallocatePartyAHandler} from "./handlers/DeallocatePartyAHandler"
import {DeallocatePartyA} from "../generated/symmio/symmio"
		
import {AllocatePartyAHandler} from "./handlers/AllocatePartyAHandler"
import {AllocatePartyA} from "../generated/symmio/symmio"
		
import {DeallocateForPartyBHandler} from "./handlers/DeallocateForPartyBHandler"
import {DeallocateForPartyB} from "../generated/symmio/symmio"
		
import {AllocateForPartyBHandler} from "./handlers/AllocateForPartyBHandler"
import {AllocateForPartyB} from "../generated/symmio/symmio"
		
export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler(event)
	handler.handle()
}
		
export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler(event)
	handler.handle()
}
		
export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler(event)
	handler.handle()
}
		
export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler(event)
	handler.handle()
}
		
export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler(event)
	handler.handle()
}
		
export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler(event)
	handler.handle()
}
		