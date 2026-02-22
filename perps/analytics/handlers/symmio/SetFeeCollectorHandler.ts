
import { SetFeeCollectorHandler as CommonSetFeeCollectorHandler } from "../../../common/handlers/symmio/SetFeeCollectorHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetFeeCollectorHandler<T> extends CommonSetFeeCollectorHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
