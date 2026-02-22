
import { AddMarginHandler as CommonAddMarginHandler } from "../../../common/handlers/accountLayer/AddMarginHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AddMarginHandler<T> extends CommonAddMarginHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
