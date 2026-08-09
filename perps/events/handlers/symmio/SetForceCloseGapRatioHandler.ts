import { SetForceCloseGapRatio as SetForceCloseGapRatioEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SetForceCloseGapRatioHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetForceCloseGapRatioEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.oldForceCloseGapRatio = event.params.oldForceCloseGapRatio
		entity.newForceCloseGapRatio = event.params.newForceCloseGapRatio
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.symbolId = _event.parameters.length >= 3 ? _event.parameters[0].value.toBigInt() : BigInt.zero()

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
