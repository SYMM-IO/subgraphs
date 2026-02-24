import { RoleGranted as RoleGrantedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class RoleGrantedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RoleGrantedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.role = event.params.role
		entity.account = event.params.account
		entity.sender = event.params.sender
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
