
import { RoleGrantedHandler as CommonRoleGrantedHandler } from "../../../common/handlers/accountLayer/RoleGrantedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RoleGrantedHandler<T> extends CommonRoleGrantedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
