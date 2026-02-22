
import { VirtualAccountReusedHandler as CommonVirtualAccountReusedHandler } from "../../../common/handlers/accountLayer/VirtualAccountReusedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class VirtualAccountReusedHandler<T> extends CommonVirtualAccountReusedHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
