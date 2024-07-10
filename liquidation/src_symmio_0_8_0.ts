import {AllocateForPartyBHandler} from "./handlers/symmio/AllocateForPartyBHandler"
import {
	AllocateForPartyB,
	AllocatePartyA,
	DeallocateForPartyB,
	DeallocatePartyA,
	LiquidatePartyA,
	LiquidatePartyB
} from "../generated/symmio_0_8_0/symmio_0_8_0"

import {DeallocatePartyAHandler} from "./handlers/symmio/DeallocatePartyAHandler"

import {DeallocateForPartyBHandler} from "./handlers/symmio/DeallocateForPartyBHandler"

import {LiquidatePartyBHandler} from "./handlers/symmio/LiquidatePartyBHandler"

import {AllocatePartyAHandler} from "./handlers/symmio/AllocatePartyAHandler"

import {LiquidatePartyAHandler} from "./handlers/symmio/LiquidatePartyAHandler"


import {Version} from "../common/BaseHandler"

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler<AllocatePartyA>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
	handler.handle(event, Version.v_0_8_0)
}
        