import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { AggregatedPosition } from "../../../generated/schema"

const FACTOR: BigInt = BigInt.fromString("1000000000000000000")

function getEntityId(partyA: Address, partyB: Address, symbolId: BigInt, positionType: i32, source: Address): string {
	return (
		partyA.toHexString() +
		"-" +
		partyB.toHexString() +
		"-" +
		symbolId.toString() +
		"-" +
		positionType.toString() +
		"-" +
		source.toHexString()
	)
}

function getOrCreate(
	event: ethereum.Event,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
): AggregatedPosition {
	let id = getEntityId(partyA, partyB, symbolId, positionType, event.address)
	let entity = AggregatedPosition.load(id)
	if (!entity) {
		entity = new AggregatedPosition(id)
		entity.source = event.address
		entity.partyA = partyA
		entity.partyB = partyB
		entity.symbolId = symbolId
		entity.positionType = positionType
		entity.aggregatedAmount = BigInt.zero()
		entity.aggregatedNotional = BigInt.zero()
		entity.weightedPaidFunding = BigInt.zero()
		entity.openPositionsCount = 0
		entity.isActive = false
	}
	return entity
}

function save(entity: AggregatedPosition): void {
	if (entity.aggregatedAmount.isZero() && entity.openPositionsCount == 0) {
		entity.isActive = false
	}
	entity.save()
}

// Called when a new position opens
export function onPositionOpen(
	event: ethereum.Event,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	filledAmount: BigInt,
	openedPrice: BigInt,
	accumulatedPaidFunding: BigInt,
): void {
	let entity = getOrCreate(event, partyA, partyB, symbolId, positionType)
	entity.aggregatedAmount = entity.aggregatedAmount.plus(filledAmount)
	entity.aggregatedNotional = entity.aggregatedNotional.plus(filledAmount.times(openedPrice))
	entity.weightedPaidFunding = entity.weightedPaidFunding.plus(filledAmount.times(accumulatedPaidFunding).div(FACTOR))
	entity.openPositionsCount += 1
	entity.isActive = true
	entity.closedTimestamp = null
	entity.closedBlockNumber = null
	entity.closedTransaction = null
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}

// Called when a position is partially or fully closed / liquidated
export function onPositionClose(
	event: ethereum.Event,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	closedAmount: BigInt,
	openedPrice: BigInt,
	accumulatedPaidFunding: BigInt,
	isFullyClose: boolean,
): void {
	let id = getEntityId(partyA, partyB, symbolId, positionType, event.address)
	let entity = AggregatedPosition.load(id)
	if (!entity) return
	entity.aggregatedAmount = entity.aggregatedAmount.minus(closedAmount)
	entity.aggregatedNotional = entity.aggregatedNotional.minus(closedAmount.times(openedPrice))
	entity.weightedPaidFunding = entity.weightedPaidFunding.minus(closedAmount.times(accumulatedPaidFunding).div(FACTOR))
	if (isFullyClose) entity.openPositionsCount -= 1
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	if (entity.aggregatedAmount.isZero() && entity.openPositionsCount == 0) {
		entity.isActive = false
		entity.closedTimestamp = event.block.timestamp
		entity.closedBlockNumber = event.block.number
		entity.closedTransaction = event.transaction.hash
	}
	save(entity)
}

// Called when openedPrice changes (settlement, ChargeFundingRate)
export function onPriceUpdate(
	event: ethereum.Event,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	openAmount: BigInt,
	prevPrice: BigInt,
	newPrice: BigInt,
): void {
	if (prevPrice.equals(newPrice)) return
	let id = getEntityId(partyA, partyB, symbolId, positionType, event.address)
	let entity = AggregatedPosition.load(id)
	if (!entity) return
	// notional delta = openAmount * (newPrice - prevPrice)
	let delta = openAmount.times(newPrice.minus(prevPrice))
	entity.aggregatedNotional = entity.aggregatedNotional.plus(delta)
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}

// Called when accumulatedPaidFunding changes (ChargeAccumulatedFundingFee)
export function onFundingUpdate(
	event: ethereum.Event,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	openAmount: BigInt,
	prevFunding: BigInt,
	newFunding: BigInt,
): void {
	if (prevFunding.equals(newFunding)) return
	let id = getEntityId(partyA, partyB, symbolId, positionType, event.address)
	let entity = AggregatedPosition.load(id)
	if (!entity) return
	// delta = openAmount * (newFunding - prevFunding) / 1e18
	let oldContrib = openAmount.times(prevFunding).div(FACTOR)
	let newContrib = openAmount.times(newFunding).div(FACTOR)
	entity.weightedPaidFunding = entity.weightedPaidFunding.plus(newContrib.minus(oldContrib))
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}
