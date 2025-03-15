import { ethereum } from "@graphprotocol/graph-ts"
import { SymmTokenVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { Approval } from "../../../generated/schema"

export class ApprovalHandler<T> {
	handle(_event: ethereum.Event, version: SymmTokenVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new Approval(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.owner = event.params.owner
		entity.spender = event.params.spender
		entity.value = event.params.value
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
