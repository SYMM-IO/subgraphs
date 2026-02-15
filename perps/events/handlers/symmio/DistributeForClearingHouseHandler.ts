import { DistributeForClearingHouse as DistributeForClearingHouseEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class DistributeForClearingHouseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new DistributeForClearingHouseEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.subject = event.params.subject
		let receivers: Bytes[] = []
		for (let i = 0; i < event.params.receivers.length; i++) {
			receivers.push(event.params.receivers[i])
		}
		entity.receivers = receivers
		let allocationKeys: Bytes[] = []
		for (let i = 0; i < event.params.allocationKeys.length; i++) {
			allocationKeys.push(event.params.allocationKeys[i])
		}
		entity.allocationKeys = allocationKeys
		entity.amounts = event.params.amounts

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
