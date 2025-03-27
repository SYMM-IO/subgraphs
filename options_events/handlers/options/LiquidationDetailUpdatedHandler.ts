import { LiquidationDetailUpdated as LiquidationDetailUpdatedEntity } from "../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { OpVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class LiquidationDetailUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: OpVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidationDetailUpdatedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.partyB = event.params.partyB
		entity.collateral = event.params.collateral

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
