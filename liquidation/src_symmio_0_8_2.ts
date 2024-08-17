import {AllocateForPartyBHandler} from './handlers/symmio/AllocateForPartyBHandler'
import {AllocateForPartyB} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {AllocatePartyAHandler} from './handlers/symmio/AllocatePartyAHandler'
import {AllocatePartyA} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {DeallocateForPartyBHandler} from './handlers/symmio/DeallocateForPartyBHandler'
import {DeallocateForPartyB} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {DeallocatePartyAHandler} from './handlers/symmio/DeallocatePartyAHandler'
import {DeallocatePartyA} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {SetSymbolsPricesHandler} from './handlers/symmio/SetSymbolsPricesHandler'
import {SetSymbolsPrices} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {SettlePartyALiquidation} from '../generated/symmio_0_8_2/symmio_0_8_2'
import {Version} from '../common/BaseHandler'


export function handleSetSymbolsPrices(event: SetSymbolsPrices): void {
    let handler = new SetSymbolsPricesHandler<SetSymbolsPrices>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleLiquidatePartyA(event: LiquidatePartyA): void {
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleAllocatePartyA(event: AllocatePartyA): void {
    let handler = new AllocatePartyAHandler<AllocatePartyA>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleDeallocatePartyA(event: DeallocatePartyA): void {
    let handler = new DeallocatePartyAHandler<DeallocatePartyA>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleDeallocateForPartyB(event: DeallocateForPartyB): void {
    let handler = new DeallocateForPartyBHandler<DeallocateForPartyB>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleAllocateForPartyB(event: AllocateForPartyB): void {
    let handler = new AllocateForPartyBHandler<AllocateForPartyB>()
    handler.handle(event, Version.v_0_8_2)
}
        

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_2)
}
        