import { SendTransferIntent as SendTransferIntentEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SendTransferIntentHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SendTransferIntentEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.tradeId = event.params.tradeId
		entity.sender = event.params.sender
		const partyBWhitelist: Bytes[] = []
		for (let i = 0; i < event.params.partyBWhitelist.length; i++) {
			partyBWhitelist.push(event.params.partyBWhitelist[i])
		}
		entity.partyBWhitelist = partyBWhitelist
		entity.price = event.params.price
		entity.deadline = event.params.deadline

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
