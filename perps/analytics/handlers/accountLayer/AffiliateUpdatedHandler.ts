
import { AffiliateUpdatedHandler as CommonAffiliateUpdatedHandler } from "../../../common/handlers/accountLayer/AffiliateUpdatedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AffiliateUpdatedHandler<T> extends CommonAffiliateUpdatedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
