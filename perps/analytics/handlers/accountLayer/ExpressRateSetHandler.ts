
import { ExpressRateSetHandler as CommonExpressRateSetHandler } from "../../../common/handlers/accountLayer/ExpressRateSetHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class ExpressRateSetHandler<T> extends CommonExpressRateSetHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
