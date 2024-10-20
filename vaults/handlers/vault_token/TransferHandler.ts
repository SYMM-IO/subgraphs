import {ethereum} from "@graphprotocol/graph-ts"
import {VaultTokenVersion} from "../../../common/BaseHandler"
import {TransferHandler as CommonTransferHandler} from "../common/TransferHandler"

export class TransferHandler<T> extends CommonTransferHandler<T> {
    handle(_event: ethereum.Event, version: VaultTokenVersion): void {
        super.handle(_event, version)
    }
}
