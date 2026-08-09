import { SignerScopeUpdated as SignerScopeUpdatedEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SignerScopeUpdatedHandler<T> {
	handle(_event: ethereum.Event, _version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new SignerScopeUpdatedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.signer = event.params.signer
		entity.scope = event.params.scope
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
