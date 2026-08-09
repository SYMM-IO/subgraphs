import { TransferAllocation as TransferAllocationEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class TransferAllocationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new TransferAllocationEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.amount = event.params.amount
		entity.origin = event.params.origin
		entity.recipient = event.params.recipient
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.originNewAllocatedBalance = BigInt.zero()
		entity.recipientNewAllocatedBalance = BigInt.zero()
		if (_event.parameters.length >= 5) {
			entity.originNewAllocatedBalance = _event.parameters[2].value.toBigInt()
			entity.recipientNewAllocatedBalance = _event.parameters[4].value.toBigInt()
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
