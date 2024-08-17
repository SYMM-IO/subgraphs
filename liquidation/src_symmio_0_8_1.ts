import {LiquidatePartyAHandler} from './handlers/symmio/LiquidatePartyAHandler'
import {LiquidatePartyA} from '../generated/symmio_0_8_1/symmio_0_8_1'
import {LiquidatePartyBHandler} from './handlers/symmio/LiquidatePartyBHandler'
import {LiquidatePartyB} from '../generated/symmio_0_8_1/symmio_0_8_1'
import {SettlePartyALiquidationHandler} from './handlers/symmio/SettlePartyALiquidationHandler'
import {SettlePartyALiquidation} from '../generated/symmio_0_8_1/symmio_0_8_1'
import {Version} from '../common/BaseHandler'


export function handleLiquidatePartyA(event: LiquidatePartyA): void {
    let handler = new LiquidatePartyAHandler<LiquidatePartyA>()
    handler.handle(event, Version.v_0_8_1)
}
        

export function handleSettlePartyALiquidation(event: SettlePartyALiquidation): void {
    let handler = new SettlePartyALiquidationHandler<SettlePartyALiquidation>()
    handler.handle(event, Version.v_0_8_1)
}
        

export function handleLiquidatePartyB(event: LiquidatePartyB): void {
    let handler = new LiquidatePartyBHandler<LiquidatePartyB>()
    handler.handle(event, Version.v_0_8_1)
}
        