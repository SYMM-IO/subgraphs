
import { SetSymbolTradingFeeHandler as CommonSetSymbolTradingFeeHandler } from "../../../common/handlers/symmio/SetSymbolTradingFeeHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolTradingFeeHandler<T> extends CommonSetSymbolTradingFeeHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        this.handleSymbol(_event, version)

    }
}
