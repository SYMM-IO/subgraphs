// biome-ignore-all lint/style/useImportType: AssemblyScript does not support type-only imports.
import { SendOpenIntent as SendOpenIntentEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SendOpenIntentHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-expect-error
		const event = changetype<T>(_event)

		const entity = new SendOpenIntentEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.partyA = event.params.partyA
		entity.intentId = event.params.intentId
		const partyBsWhiteList: Bytes[] = []
		for (let i = 0; i < event.params.partyBsWhiteList.length; i++) {
			partyBsWhiteList.push(event.params.partyBsWhiteList[i])
		}
		entity.partyBsWhiteList = partyBsWhiteList
		entity.requestedParams = event.params.requestedParams

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
