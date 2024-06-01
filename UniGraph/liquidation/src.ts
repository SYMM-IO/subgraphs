
import {LiquidatePartyBHandler} from "./handlers/LiquidatePartyBHandler"
import {LiquidatePartyB} from "../generated/symmio/symmio"
		
import {LiquidatePendingPositionsPartyAHandler} from "./handlers/LiquidatePendingPositionsPartyAHandler"
import {LiquidatePendingPositionsPartyA} from "../generated/symmio/symmio"
		
import {LiquidatePartyAHandler} from "./handlers/LiquidatePartyAHandler"
import {LiquidatePartyA} from "../generated/symmio/symmio"
		
export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler(event)
	handler.handle()
}
		
export function handleLiquidatePendingPositionsPartyA(event: LiquidatePendingPositionsPartyA): void {
	let handler = new LiquidatePendingPositionsPartyAHandler(event)
	handler.handle()
}
		
export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler(event)
	handler.handle()
}
		