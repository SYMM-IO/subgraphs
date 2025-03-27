import { ethereum } from "@graphprotocol/graph-ts"
import { SymmStakingVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { UpdateWhitelist } from "../../../generated/schema"

export class UpdateWhitelistHandler<T> {
	handle(_event: ethereum.Event, version: SymmStakingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new UpdateWhitelist(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.token = event.params.token
		entity.whitelist = event.params.whitelist
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
