import { Liquidate as LiquidateEntity } from "../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { OpVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class LiquidateHandler<T> {
	handle(_event: ethereum.Event, version: OpVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidateEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.liquidationId = event.params.liquidationId
		entity.liquidator = event.params.liquidator
		entity.partyB = event.params.partyB
		entity.collateral = event.params.collateral
		entity.balance = event.params.balance
		entity.upnl = event.params.upnl
		entity.collateralPrice = event.params.collateralPrice

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
