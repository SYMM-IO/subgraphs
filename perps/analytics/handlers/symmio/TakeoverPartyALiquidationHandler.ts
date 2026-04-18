
import { TakeoverPartyALiquidationHandler as CommonTakeoverPartyALiquidationHandler } from "../../../common/handlers/symmio/TakeoverPartyALiquidationHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class TakeoverPartyALiquidationHandler<T> extends CommonTakeoverPartyALiquidationHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)
        super.handleQuote(_event, version)
    }
}
