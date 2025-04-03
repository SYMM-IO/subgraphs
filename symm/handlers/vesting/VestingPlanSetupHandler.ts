import { ethereum } from "@graphprotocol/graph-ts"
import { SymmVestingVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { VestingPlanSetup } from "../../../generated/schema"

export class VestingPlanSetupHandler<T> {
	handle(_event: ethereum.Event, version: SymmVestingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new VestingPlanSetup(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.token = event.params.token
		entity.user = event.params.user
		entity.amount = event.params.amount
		entity.startTime = event.params.startTime
		entity.endTime = event.params.endTime
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
