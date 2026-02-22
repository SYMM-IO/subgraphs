
import { AffiliateApprovedHandler as CommonAffiliateApprovedHandler } from "../../../common/handlers/accountLayer/AffiliateApprovedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AffiliateApprovedHandler<T> extends CommonAffiliateApprovedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
