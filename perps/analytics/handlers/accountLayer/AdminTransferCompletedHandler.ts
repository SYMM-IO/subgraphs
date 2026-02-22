
import { AdminTransferCompletedHandler as CommonAdminTransferCompletedHandler } from "../../../common/handlers/accountLayer/AdminTransferCompletedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AdminTransferCompletedHandler<T> extends CommonAdminTransferCompletedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
