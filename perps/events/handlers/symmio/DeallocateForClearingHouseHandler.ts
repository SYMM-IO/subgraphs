import { DeallocateForClearingHouse as DeallocateForClearingHouseEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class DeallocateForClearingHouseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new DeallocateForClearingHouseEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.subject = event.params.subject
		let parties: Bytes[] = []
		for (let i = 0; i < event.params.parties.length; i++) {
			parties.push(event.params.parties[i])
		}
		entity.parties = parties
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
