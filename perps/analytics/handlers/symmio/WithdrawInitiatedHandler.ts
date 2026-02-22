
import { WithdrawInitiatedHandler as CommonWithdrawInitiatedHandler } from "../../../common/handlers/symmio/WithdrawInitiatedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class WithdrawInitiatedHandler<T> extends CommonWithdrawInitiatedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
