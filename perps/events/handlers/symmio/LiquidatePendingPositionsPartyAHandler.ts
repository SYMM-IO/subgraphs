import { LiquidatePendingPositionsPartyA as LiquidatePendingPositionsPartyAEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class LiquidatePendingPositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePendingPositionsPartyAEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.liquidator = event.params.liquidator
		entity.partyA = event.params.partyA
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.quoteIds = []
		entity.liquidatedAmounts = []
		entity.liquidationId = Bytes.empty()
		if (_event.parameters.length >= 5) {
			entity.quoteIds = _event.parameters[2].value.toBigIntArray()
			entity.liquidatedAmounts = _event.parameters[3].value.toBigIntArray()
			entity.liquidationId = _event.parameters[4].value.toBytes()
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
