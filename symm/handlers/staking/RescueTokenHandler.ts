import { ethereum } from "@graphprotocol/graph-ts"
import { SymmStakingVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { RescueToken } from "../../../generated/schema"

export class RescueTokenHandler<T> {
	handle(_event: ethereum.Event, version: SymmStakingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RescueToken(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.token = event.params.token
		entity.amount = event.params.amount
		entity.receiver = event.params.receiver
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
