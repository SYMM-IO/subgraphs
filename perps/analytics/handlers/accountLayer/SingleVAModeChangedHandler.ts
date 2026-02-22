
import { SingleVAModeChangedHandler as CommonSingleVAModeChangedHandler } from "../../../common/handlers/accountLayer/SingleVAModeChangedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class SingleVAModeChangedHandler<T> extends CommonSingleVAModeChangedHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
