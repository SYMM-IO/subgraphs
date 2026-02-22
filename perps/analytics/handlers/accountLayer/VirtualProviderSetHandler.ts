
import { VirtualProviderSetHandler as CommonVirtualProviderSetHandler } from "../../../common/handlers/accountLayer/VirtualProviderSetHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class VirtualProviderSetHandler<T> extends CommonVirtualProviderSetHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
