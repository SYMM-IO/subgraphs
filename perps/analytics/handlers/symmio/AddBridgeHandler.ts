
import { AddBridgeHandler as CommonAddBridgeHandler } from "../../../common/handlers/symmio/AddBridgeHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AddBridgeHandler<T> extends CommonAddBridgeHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        this.handleAccount(_event, version)

    }
}
