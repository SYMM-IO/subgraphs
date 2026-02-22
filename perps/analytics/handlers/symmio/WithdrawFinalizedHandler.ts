
import { WithdrawFinalizedHandler as CommonWithdrawFinalizedHandler } from "../../../common/handlers/symmio/WithdrawFinalizedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class WithdrawFinalizedHandler<T> extends CommonWithdrawFinalizedHandler<T> {
    handle(_event: ethereum.Event, version: Version): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        super.handle(_event, version)

    }
}
