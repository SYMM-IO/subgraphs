import {ethereum} from "@graphprotocol/graph-ts"
import {VaultTokenVersion} from "../../../common/BaseHandler"
import {Transfer} from "../../../generated/schema";

export class TransferHandler<T> {
    handle(_event: ethereum.Event, version: VaultTokenVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        let transfer = new Transfer(_event.transaction.hash.toHexString() + "_" + _event.logIndex.toString())
        transfer.from = event.params.from
        transfer.source = event.address
        transfer.sender = _event.transaction.from
        transfer.to = event.params.to
        transfer.amount = event.params.value
        transfer.transaction = _event.transaction.hash
        transfer.blockNumber = event.block.number
        transfer.timestamp = event.block.timestamp
        transfer.save()
    }
}
