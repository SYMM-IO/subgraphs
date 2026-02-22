
import { AffiliateRegisteredHandler as CommonAffiliateRegisteredHandler } from "../../../common/handlers/accountLayer/AffiliateRegisteredHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AffiliateRegisteredHandler<T> extends CommonAffiliateRegisteredHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
