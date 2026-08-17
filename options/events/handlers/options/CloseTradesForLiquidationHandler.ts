import { CloseTradesForLiquidation as CloseTradesForLiquidationEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class CloseTradesForLiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new CloseTradesForLiquidationEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		const tradeIds: BigInt[] = []
		for (let i = 0; i < event.params.tradeIds.length; i++) {
			tradeIds.push(event.params.tradeIds[i])
		}
		entity.tradeIds = tradeIds
		const prices: BigInt[] = []
		for (let i = 0; i < event.params.prices.length; i++) {
			prices.push(event.params.prices[i])
		}
		entity.prices = prices

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
