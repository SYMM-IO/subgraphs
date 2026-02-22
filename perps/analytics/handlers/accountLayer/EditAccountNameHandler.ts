
import { EditAccountNameHandler as CommonEditAccountNameHandler } from "../../../common/handlers/accountLayer/EditAccountNameHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class EditAccountNameHandler<T> extends CommonEditAccountNameHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
