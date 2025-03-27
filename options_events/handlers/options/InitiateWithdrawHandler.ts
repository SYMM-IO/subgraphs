import { InitiateWithdraw as InitiateWithdrawEntity } from "../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { OpVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class InitiateWithdrawHandler<T> {
	handle(_event: ethereum.Event, version: OpVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new InitiateWithdrawEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.withdrawId = event.params.id
		entity.user = event.params.user
		entity.to = event.params.to
		entity.collateral = event.params.collateral
		entity.amount = event.params.amount
		entity.newBalance = event.params.newBalance

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
