import { LiquidatePartyA as LiquidatePartyAEntity } from "../../../../generated/schema"
import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class LiquidatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePartyAEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.liquidator = event.params.liquidator
		entity.partyA = event.params.partyA
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.allocatedBalance = BigInt.zero()
		entity.upnl = BigInt.zero()
		entity.totalUnrealizedLoss = BigInt.zero()
		entity.liquidationId = Bytes.empty()
		if (_event.parameters.length >= 5) {
			entity.allocatedBalance = _event.parameters[2].value.toBigInt()
			entity.upnl = _event.parameters[3].value.toBigInt()
			entity.totalUnrealizedLoss = _event.parameters[4].value.toBigInt()
			if (_event.parameters.length >= 6) entity.liquidationId = _event.parameters[5].value.toBytes()
		}

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
