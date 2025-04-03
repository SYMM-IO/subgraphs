import { ethereum } from "@graphprotocol/graph-ts"
import { SymmTokenVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { Transfer } from "../../../generated/schema"

export class TransferHandler<T> {
	handle(_event: ethereum.Event, version: SymmTokenVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new Transfer(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.from = event.params.from
		entity.to = event.params.to
		entity.value = event.params.value
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
