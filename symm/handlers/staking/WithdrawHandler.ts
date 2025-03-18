import { ethereum } from "@graphprotocol/graph-ts"
import { SymmStakingVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { Withdraw } from "../../../generated/schema"

export class WithdrawHandler<T> {
	handle(_event: ethereum.Event, version: SymmStakingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new Withdraw(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.sender = event.params.sender
		entity.amount = event.params.amount
		entity.to = event.params.to
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
