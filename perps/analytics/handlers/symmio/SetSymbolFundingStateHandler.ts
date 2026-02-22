
import { SetSymbolFundingStateHandler as CommonSetSymbolFundingStateHandler } from "../../../common/handlers/symmio/SetSymbolFundingStateHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolFundingStateHandler<T> extends CommonSetSymbolFundingStateHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        this.handleSymbol(_event, version)

    }
}
