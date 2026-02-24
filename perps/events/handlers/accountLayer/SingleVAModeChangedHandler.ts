import { SingleVAModeChanged as SingleVAModeChangedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SingleVAModeChangedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SingleVAModeChangedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.subAccount = event.params.subAccount
		entity.enabled = event.params.enabled
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
