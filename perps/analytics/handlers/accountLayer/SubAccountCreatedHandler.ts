
import { SubAccountCreatedHandler as CommonSubAccountCreatedHandler } from "../../../common/handlers/accountLayer/SubAccountCreatedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class SubAccountCreatedHandler<T> extends CommonSubAccountCreatedHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
