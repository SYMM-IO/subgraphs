import { ethereum } from "@graphprotocol/graph-ts"
import { SymmVestingVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { VestingInitialized } from "../../../generated/schema"

export class InitializedHandler<T> {
	handle(_event: ethereum.Event, version: SymmVestingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new VestingInitialized(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.version = event.params.version
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
