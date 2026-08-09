import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Buyback } from "../../../../generated/schema"
import { BuybackGatewayVersion } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"
import { getBuybackDayId, getOrCreateBuybackDay, getOrCreateBuybackGatewayStats, tryGetBuybackToken, tryGetSymmToken } from "../../utils/buyback"

export class BuybackExecutedHandler<T> {
	handle(_event: ethereum.Event, version: BuybackGatewayVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let inputToken = tryGetBuybackToken(event.address)
		let outputToken = tryGetSymmToken(event.address)

		let entity = new Buyback(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.gateway = event.address
		entity.operator = event.params.operator
		if (inputToken) entity.inputToken = inputToken
		if (outputToken) entity.outputToken = outputToken
		entity.callTarget = event.params.callTarget
		entity.allowanceTarget = event.params.allowanceTarget
		entity.amountIn = event.params.amountIn
		entity.minAmountOut = event.params.minAmountOut
		entity.amountOut = event.params.amountOut
		entity.settlementMode = event.params.settlementMode
		entity.dayTotal = event.params.dayTotal
		entity.dayId = getBuybackDayId(event.block.timestamp)
		entity.blockNumber = event.block.number
		entity.blockTimestamp = event.block.timestamp
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()

		let stats = getOrCreateBuybackGatewayStats(event)
		stats.totalAmountIn = stats.totalAmountIn.plus(event.params.amountIn)
		stats.totalAmountOut = stats.totalAmountOut.plus(event.params.amountOut)
		stats.buybackCount = stats.buybackCount.plus(BigInt.fromI32(1))
		if (inputToken) stats.inputToken = inputToken
		if (outputToken) stats.outputToken = outputToken
		stats.save()

		let day = getOrCreateBuybackDay(event)
		day.amountIn = day.amountIn.plus(event.params.amountIn)
		day.amountOut = day.amountOut.plus(event.params.amountOut)
		day.buybackCount = day.buybackCount.plus(BigInt.fromI32(1))
		day.save()
	}
}
