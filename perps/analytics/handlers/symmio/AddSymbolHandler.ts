
import { AddSymbolHandler as CommonAddSymbolHandler } from "../../../common/handlers/symmio/AddSymbolHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AddSymbolHandler<T> extends CommonAddSymbolHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        this.handleSymbol(_event, version)

    }
}
