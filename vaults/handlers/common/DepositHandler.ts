import {ethereum} from "@graphprotocol/graph-ts"
import {VaultVersion} from "../../../common/BaseHandler"
import {Deposit} from "../../../generated/schema";


export class DepositHandler<T> {
    handle(_event: ethereum.Event, version: VaultVersion): void {
        // @ts-ignore
        const event = changetype<T>(_event)
        let deposit = new Deposit(_event.transaction.hash.toHexString() + "_" + _event.logIndex.toString())
        deposit.source = event.address
        deposit.user = event.params.depositor
        deposit.sender = _event.transaction.from
        deposit.amount = event.params.amount
        deposit.timestamp = event.block.timestamp
        deposit.blockNumber = event.block.number
        deposit.transaction = _event.transaction.hash
        deposit.save()
    }
}
