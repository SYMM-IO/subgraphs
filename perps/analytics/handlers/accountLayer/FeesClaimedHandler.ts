
import { FeesClaimedHandler as CommonFeesClaimedHandler } from "../../../common/handlers/accountLayer/FeesClaimedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class FeesClaimedHandler<T> extends CommonFeesClaimedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
