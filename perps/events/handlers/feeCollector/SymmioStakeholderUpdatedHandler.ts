import { SymmioStakeholderUpdated as SymmioStakeholderUpdatedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { FeeCollectorVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SymmioStakeholderUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: FeeCollectorVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SymmioStakeholderUpdatedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())

		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.oldReceiver = event.params.oldReceiver
		entity.newReceiver = event.params.newReceiver
		entity.oldShare = event.params.oldShare
		entity.newShare = event.params.newShare
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
