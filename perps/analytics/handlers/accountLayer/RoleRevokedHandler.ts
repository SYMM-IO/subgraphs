
import { RoleRevokedHandler as CommonRoleRevokedHandler } from "../../../common/handlers/accountLayer/RoleRevokedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RoleRevokedHandler<T> extends CommonRoleRevokedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
