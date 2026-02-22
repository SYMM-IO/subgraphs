
import { SubAccountDeletedHandler as CommonSubAccountDeletedHandler } from "../../../common/handlers/accountLayer/SubAccountDeletedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class SubAccountDeletedHandler<T> extends CommonSubAccountDeletedHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
