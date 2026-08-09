import { LiquidatePositionsPartyB as LiquidatePositionsPartyBEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class LiquidatePositionsPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePositionsPartyBEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.liquidator = event.params.liquidator
		entity.partyB = event.params.partyB
		entity.partyA = event.params.partyA
		entity.quoteIds = event.params.quoteIds
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.liquidatedAmounts = []
		entity.closeIds = []
		entity.averageClosedPrices = []

		// v0.8.3+ emit amounts and close ids; the canonical overload appends
		// averageClosedPrices.
		if (_event.parameters.length >= 6) {
			entity.liquidatedAmounts = _event.parameters[4].value.toBigIntArray()
			entity.closeIds = _event.parameters[5].value.toBigIntArray()
			if (_event.parameters.length >= 7) {
				entity.averageClosedPrices = _event.parameters[6].value.toBigIntArray()
			}
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
