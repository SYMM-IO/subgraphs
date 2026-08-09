import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { buybackGateway_1 } from "../../../generated/buybackGateway_1/buybackGateway_1"
import { BuybackDay, BuybackGatewayStats } from "../../../generated/schema"

const SECONDS_IN_DAY = BigInt.fromI32(86400)

export function getBuybackDayId(timestamp: BigInt): BigInt {
	return timestamp.div(SECONDS_IN_DAY)
}

export function getOrCreateBuybackGatewayStats(event: ethereum.Event): BuybackGatewayStats {
	let id = event.address.toHexString()
	let stats = BuybackGatewayStats.load(id)
	if (!stats) {
		stats = new BuybackGatewayStats(id)
		stats.gateway = event.address
		stats.totalDeposited = BigInt.zero()
		stats.totalAmountIn = BigInt.zero()
		stats.totalAmountOut = BigInt.zero()
		stats.depositCount = BigInt.zero()
		stats.buybackCount = BigInt.zero()
		stats.firstActivityAt = event.block.timestamp
	}
	stats.lastActivityAt = event.block.timestamp
	stats.lastActivityBlock = event.block.number
	return stats
}

export function getOrCreateBuybackDay(event: ethereum.Event): BuybackDay {
	let dayId = getBuybackDayId(event.block.timestamp)
	let id = event.address.toHexString() + "-" + dayId.toString()
	let day = BuybackDay.load(id)
	if (!day) {
		day = new BuybackDay(id)
		day.gateway = event.address
		day.dayId = dayId
		day.dayStart = dayId.times(SECONDS_IN_DAY)
		day.depositedAmount = BigInt.zero()
		day.amountIn = BigInt.zero()
		day.amountOut = BigInt.zero()
		day.depositCount = BigInt.zero()
		day.buybackCount = BigInt.zero()
	}
	day.lastActivityAt = event.block.timestamp
	return day
}

export function tryGetBuybackToken(gatewayAddress: Address): Address | null {
	let gateway = buybackGateway_1.bind(gatewayAddress)
	let result = gateway.try_buybackToken()
	return result.reverted ? null : result.value
}

export function tryGetSymmToken(gatewayAddress: Address): Address | null {
	let gateway = buybackGateway_1.bind(gatewayAddress)
	let result = gateway.try_symmToken()
	return result.reverted ? null : result.value
}
