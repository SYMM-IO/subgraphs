import { OwnershipTransferred as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class OwnershipTransferredHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.previousOwner = event.params.previousOwner
		entity.newOwner = event.params.newOwner
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
