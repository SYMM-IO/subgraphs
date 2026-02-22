
import { EmergencyMarginRecoveredHandler as CommonEmergencyMarginRecoveredHandler } from "../../../common/handlers/accountLayer/EmergencyMarginRecoveredHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class EmergencyMarginRecoveredHandler<T> extends CommonEmergencyMarginRecoveredHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
