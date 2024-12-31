import { SetDefaultFeeCollector as SetDefaultFeeCollectorEntity } from "../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SetDefaultFeeCollectorHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetDefaultFeeCollectorEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()

		entity.newDefaultFeeCollector = event.params.newDefaultFeeCollector
		entity.oldDefaultFeeCollector = event.params.oldDefaultFeeCollector

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionLogIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
