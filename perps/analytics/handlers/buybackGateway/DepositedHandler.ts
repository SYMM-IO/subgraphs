import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { BuybackDeposit } from "../../../../generated/schema"
import { BuybackGatewayVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { getBuybackDayId, getOrCreateBuybackDay, getOrCreateBuybackGatewayStats } from "../../utils/buyback"

export class DepositedHandler<T> {
	handle(_event: ethereum.Event, version: BuybackGatewayVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new BuybackDeposit(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.gateway = event.address
		entity.depositor = event.params.depositor
		entity.token = event.params.token
		entity.amount = event.params.amount
		entity.depositSource = event.params.source
		entity.dayId = getBuybackDayId(event.block.timestamp)
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()

		let stats = getOrCreateBuybackGatewayStats(event)
		stats.totalDeposited = stats.totalDeposited.plus(event.params.amount)
		stats.depositCount = stats.depositCount.plus(BigInt.fromI32(1))
		stats.inputToken = event.params.token
		stats.save()

		let day = getOrCreateBuybackDay(event)
		day.depositedAmount = day.depositedAmount.plus(event.params.amount)
		day.depositCount = day.depositCount.plus(BigInt.fromI32(1))
		day.save()
	}
}
