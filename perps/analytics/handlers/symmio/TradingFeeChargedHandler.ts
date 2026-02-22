
import { TradingFeeChargedHandler as CommonTradingFeeChargedHandler } from "../../../common/handlers/symmio/TradingFeeChargedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class TradingFeeChargedHandler<T> extends CommonTradingFeeChargedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
