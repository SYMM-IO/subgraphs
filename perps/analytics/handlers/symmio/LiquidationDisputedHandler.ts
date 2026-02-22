
import { LiquidationDisputedHandler as CommonLiquidationDisputedHandler } from "../../../common/handlers/symmio/LiquidationDisputedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LiquidationDisputedHandler<T> extends CommonLiquidationDisputedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
