import { SyncBalances as SyncBalancesEntity } from "../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { OpVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class SyncBalancesHandler<T> {
	handle(_event: ethereum.Event, version: OpVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SyncBalancesEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.collateral = event.params.collateral
		entity.partyA = event.params.partyA

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
