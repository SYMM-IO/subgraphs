import { WithdrawPart, WithdrawInitiated as WithdrawInitiatedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class WithdrawInitiatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new WithdrawInitiatedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.requestId = event.params.requestId
		entity.user = event.params.user
		entity.speedUp = event.params.speedUp
		entity.providerData = event.params.providerData
		entity.cooldownEndTime = event.params.cooldownEndTime

		// Store each WithdrawPart
		let partsArray: string[] = []
		for (let i = 0; i < event.params.parts.length; i++) {
			let part = event.params.parts[i]
			let partId = event.transaction.hash.toHex() + "-" + event.logIndex.toString() + "-" + i.toString()

			let partEntity = new WithdrawPart(partId)
			partEntity.partId = part.id
			partEntity.amount = part.amount
			partEntity.chainId = part.chainId
			partEntity.receiver = part.receiver
			partEntity.virtualProvider = part.virtualProvider
			partEntity.expressProvider = part.expressProvider
			partEntity.save()

			partsArray.push(partId)
		}

		entity.parts = partsArray

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
