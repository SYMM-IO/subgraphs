
import { LegacyAccountImportedHandler as CommonLegacyAccountImportedHandler } from "../../../common/handlers/accountLayer/LegacyAccountImportedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountLayerVersion} from "../../../common/BaseHandler";

export class LegacyAccountImportedHandler<T> extends CommonLegacyAccountImportedHandler<T> {
    handle(_event: ethereum.Event, version: AccountLayerVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        // @ts-ignore
        this.handleAccount(_event, version)

    }
}
