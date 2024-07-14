
import { LiquidatePartyBHandler } from "./handlers/symmio/LiquidatePartyBHandler"
import { LiquidatePartyB, SetSymbolsPrices, SettlePartyALiquidation1 } from "../generated/symmio_0_8_2/symmio_0_8_2"

import { AllocatePartyAHandler } from "./handlers/symmio/AllocatePartyAHandler"
import { AllocatePartyA } from "../generated/symmio_0_8_2/symmio_0_8_2"

import { DeallocateForPartyBHandler } from "./handlers/symmio/DeallocateForPartyBHandler"
import { DeallocateForPartyB } from "../generated/symmio_0_8_2/symmio_0_8_2"

import { SettlePartyALiquidationHandler } from "./handlers/symmio/SettlePartyALiquidationHandler"
import { SettlePartyALiquidation } from "../generated/symmio_0_8_2/symmio_0_8_2"

import { AllocateForPartyBHandler } from "./handlers/symmio/AllocateForPartyBHandler"
import { AllocateForPartyB } from "../generated/symmio_0_8_2/symmio_0_8_2"

import { DeallocatePartyAHandler } from "./handlers/symmio/DeallocatePartyAHandler"
import { DeallocatePartyA } from "../generated/symmio_0_8_2/symmio_0_8_2"


import { LiquidatePartyAHandler } from "./handlers/symmio/LiquidatePartyAHandler"
import { LiquidatePartyA } from "../generated/symmio_0_8_2/symmio_0_8_2"

import { Version } from "../common/BaseHandler"
import { DebugEntity } from "../generated/schema"
import { SetSymbolsPricesHandler } from "./handlers/symmio/SetSymbolsPricesHandler"
export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_2)
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
    let handler = new AllocatePartyAHandler<AllocatePartyA>()
    handler.handle(event, Version.v_0_8_2)
}

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
    let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
    handler.handle(event, Version.v_0_8_2)
}

export function handleOldSettlePartyALiquidation(event: SettlePartyALiquidation): void {
    let debug = new DebugEntity('main-old')
    debug.message = "main handler"
    debug.timestamp = event.block.timestamp
    debug.save()
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
    handler.handle(event, Version.v_0_8_2)
}

export function handleSettlePartyALiquidation(event: SettlePartyALiquidation1): void {
    let debug = new DebugEntity('main-new')
    debug.message = "main handler new"
    debug.timestamp = event.block.timestamp
    debug.save()
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation1>()
    handler.handle(event, Version.v_0_8_2)
}

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
    let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
    handler.handle(event, Version.v_0_8_2)
}

export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
    let debug = new DebugEntity('SetSymbolsPrices')
    debug.message = "SetSymbolsPrices"
    debug.timestamp = event.block.timestamp
    debug.save()
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
    handler.handle(event, Version.v_0_8_2)
}

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
    let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
    handler.handle(event, Version.v_0_8_2)
}



export function handleLiquidatePartyA(event: LiquidatePartyA): void {
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_2)
}
