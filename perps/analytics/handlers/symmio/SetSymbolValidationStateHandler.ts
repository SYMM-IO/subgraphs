
import { SetSymbolValidationStateHandler as CommonSetSymbolValidationStateHandler } from "../../../common/handlers/symmio/SetSymbolValidationStateHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolValidationStateHandler<T> extends CommonSetSymbolValidationStateHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        this.handleSymbol(_event, version)

    }
}
