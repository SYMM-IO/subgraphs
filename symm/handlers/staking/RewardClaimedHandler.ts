import { ethereum } from "@graphprotocol/graph-ts"
import { SymmStakingVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { RewardClaimed } from "../../../generated/schema"

export class RewardClaimedHandler<T> {
	handle(_event: ethereum.Event, version: SymmStakingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RewardClaimed(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.user = event.params.user
		entity.rewardsToken = event.params.rewardsToken
		entity.reward = event.params.reward
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
