import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { SymmStakingVersion } from "../../BaseHandler"
import { getGlobalCounterAndInc } from "../../utils"
import { RewardNotified } from "../../../generated/schema"

export class RewardNotifiedHandler<T> {
	handle(_event: ethereum.Event, version: SymmStakingVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RewardNotified(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()

		let rewardsTokens: Bytes[] = []
		let rewards: BigInt[] = []
		let newRates: BigInt[] = []
		for (let i = 0, len = event.params.rewardsTokens.length; i < len; i++) {
			rewardsTokens.push(event.params.rewardsTokens[i])
			rewards.push(event.params.rewards[i])
			newRates.push(event.params.newRates[i])
		}
		entity.rewardsTokens = rewardsTokens
		entity.rewards = rewards
		entity.newRates = newRates

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
