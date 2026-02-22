
import { SettlePartyALiquidationHandler as CommonSettlePartyALiquidationHandler } from "../../../common/handlers/symmio/SettlePartyALiquidationHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SettlePartyALiquidationHandler<T> extends CommonSettlePartyALiquidationHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
