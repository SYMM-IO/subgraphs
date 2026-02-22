
import { VirtualAccountDeletedHandler as CommonVirtualAccountDeletedHandler } from "../../../common/handlers/accountLayer/VirtualAccountDeletedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class VirtualAccountDeletedHandler<T> extends CommonVirtualAccountDeletedHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
