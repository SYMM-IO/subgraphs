import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {
	AllocateForPartyB,
	AllocatePartyA,
	DeallocateForPartyB,
	DeallocatePartyA,
	LiquidatePartyA,
	LiquidatePartyB,
	SetSymbolsPrices,
	SettlePartyALiquidation
} from '../generated/symmio_0_8_3/symmio_0_8_3'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {Version} from '../common/BaseHandler'


export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
	let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSetSymbolsPrices1(event: SetSymbolsPrices): void {
	let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleLiquidatePartyA1(event: LiquidatePartyA): void {
	let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
	let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleSettlePartyALiquidation1(event: SettlePartyALiquidation): void {
	let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
	handler.handle(event, Version.v_0_8_3)
}

export function handleAllocatePartyA(event: AllocatePartyA): void {
	let handler = new AllocatePartyAHandler<AllocatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}


export function handleDeallocatePartyA(event: DeallocatePartyA): void {
	let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
	handler.handle(event, Version.v_0_8_3)
}


export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
	let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
	handler.handle(event, Version.v_0_8_3)
}


export function handleAllocateForPartyB(event: AllocateForPartyB): void {
	let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
	handler.handle(event, Version.v_0_8_3)
}


export function handleLiquidatePartyB(event: LiquidatePartyB): void {
	let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
	handler.handle(event, Version.v_0_8_3)
}
        