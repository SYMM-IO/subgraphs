
import { RemoveMarginHandler as CommonRemoveMarginHandler } from "../../../common/handlers/accountLayer/RemoveMarginHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RemoveMarginHandler<T> extends CommonRemoveMarginHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
