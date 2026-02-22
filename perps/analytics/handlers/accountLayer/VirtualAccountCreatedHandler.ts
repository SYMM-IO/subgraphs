
import { VirtualAccountCreatedHandler as CommonVirtualAccountCreatedHandler } from "../../../common/handlers/accountLayer/VirtualAccountCreatedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class VirtualAccountCreatedHandler<T> extends CommonVirtualAccountCreatedHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
