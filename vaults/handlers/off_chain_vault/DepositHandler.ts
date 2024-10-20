import {ethereum} from "@graphprotocol/graph-ts"
import {VaultVersion} from "../../../common/BaseHandler"
import {DepositHandler as CommonDepositHandler} from "../common/DepositHandler"

export class DepositHandler<T> extends CommonDepositHandler<T> {
    handle(_event: ethereum.Event, version: VaultVersion): void {
        super.handle(_event, version)
    }
}
