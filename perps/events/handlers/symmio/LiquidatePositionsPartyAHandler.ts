import { LiquidatePositionsPartyA as LiquidatePositionsPartyAEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class LiquidatePositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePositionsPartyAEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.liquidator = event.params.liquidator
		entity.partyA = event.params.partyA
		entity.quoteIds = event.params.quoteIds
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.liquidatedAmounts = []
		entity.closeIds = []
		entity.averageClosedPrices = []
		entity.liquidationId = Bytes.empty()

		// v0.8.3+ always emit amounts and close ids. The canonical v0.8.5/v0.8.6
		// overload inserts averageClosedPrices before liquidationId.
		if (_event.parameters.length >= 6) {
			entity.liquidatedAmounts = _event.parameters[3].value.toBigIntArray()
			entity.closeIds = _event.parameters[4].value.toBigIntArray()
			if (_event.parameters.length >= 7) {
				entity.averageClosedPrices = _event.parameters[5].value.toBigIntArray()
				entity.liquidationId = _event.parameters[6].value.toBytes()
			} else {
				entity.liquidationId = _event.parameters[5].value.toBytes()
			}
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
