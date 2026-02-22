
import { AccountManagerDeployedHandler as CommonAccountManagerDeployedHandler } from "../../../common/handlers/accountLayer/AccountManagerDeployedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AccountManagerDeployedHandler<T> extends CommonAccountManagerDeployedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
