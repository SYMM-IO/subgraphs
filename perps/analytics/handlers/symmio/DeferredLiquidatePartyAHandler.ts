
import { DeferredLiquidatePartyAHandler as CommonDeferredLiquidatePartyAHandler } from "../../../common/handlers/symmio/DeferredLiquidatePartyAHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DeferredLiquidatePartyAHandler<T> extends CommonDeferredLiquidatePartyAHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
