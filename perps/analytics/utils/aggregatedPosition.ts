import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Account, AggregatedPosition } from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"
import { resolveSymbolName } from "./symbol"
import { setAggregatedPositionProfileRefs } from "../../common/utils/profile"

const FACTOR: BigInt = BigInt.fromString("1000000000000000000")

function getEntityId(partyA: Address, partyB: Address, symbolId: BigInt, positionType: i32, source: Address): string {
	return partyA.toHexString() + "-" + partyB.toHexString() + "-" + symbolId.toString() + "-" + positionType.toString() + "-" + source.toHexString()
}

function getOrCreate(
	event: ethereum.Event,
	version: Version,
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
		entity.partyAAccount = partyA.toHexString()
		entity.partyB = partyB
		entity.symbolId = symbolId
		entity.symbolName = resolveSymbolName(version, symbolId, event.address)
		entity.positionType = positionType
		entity.aggregatedAmount = BigInt.zero()
		entity.aggregatedNotional = BigInt.zero()
		entity.weightedPaidFunding = BigInt.zero()
		entity.openPositionsCount = 0
		entity.isActive = false
	} else if (entity.symbolName.length == 0) {
		entity.symbolName = resolveSymbolName(version, symbolId, event.address)
	}
	let account = Account.load(partyA.toHexString())
	setAggregatedPositionProfileRefs(entity, account, event.address)
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
	version: Version,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	filledAmount: BigInt,
	openedPrice: BigInt,
	accumulatedPaidFunding: BigInt,
): void {
	let entity = getOrCreate(event, version, partyA, partyB, symbolId, positionType)
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

// Applies the core's funding-index update and partial/full close as one transition.
// Keeping both contribution changes together prevents fully closed buckets from
// retaining a funding residue while preserving Solidity's per-operation rounding.
export function onFundingSettlementAndPositionClose(
	event: ethereum.Event,
	version: Version,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	preCloseOpenAmount: BigInt,
	closedAmount: BigInt,
	openedPrice: BigInt,
	previousFunding: BigInt,
	newFunding: BigInt,
	isFullyClose: boolean,
): void {
	let entity = getOrCreate(event, version, partyA, partyB, symbolId, positionType)
	if (entity.aggregatedAmount.isZero() && entity.openPositionsCount == 0) return
	entity.aggregatedAmount = entity.aggregatedAmount.minus(closedAmount)
	entity.aggregatedNotional = entity.aggregatedNotional.minus(closedAmount.times(openedPrice))
	let previousContribution = preCloseOpenAmount.times(previousFunding).div(FACTOR)
	let updatedContribution = preCloseOpenAmount.times(newFunding).div(FACTOR)
	let closedContribution = closedAmount.times(newFunding).div(FACTOR)
	// Match the core's two sequential operations exactly: first update funding for
	// the whole pre-close amount, then subtract the closed amount at the new index.
	// Collapsing these into one remaining-amount multiplication can drift by one
	// wei because each Solidity division truncates independently.
	entity.weightedPaidFunding = entity.weightedPaidFunding.minus(previousContribution).plus(updatedContribution).minus(closedContribution)
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

// Called when a close does not update the quote's accumulated funding index.
export function onPositionClose(
	event: ethereum.Event,
	version: Version,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	closedAmount: BigInt,
	openedPrice: BigInt,
	accumulatedPaidFunding: BigInt,
	isFullyClose: boolean,
): void {
	onFundingSettlementAndPositionClose(
		event,
		version,
		partyA,
		partyB,
		symbolId,
		positionType,
		closedAmount,
		closedAmount,
		openedPrice,
		accumulatedPaidFunding,
		accumulatedPaidFunding,
		isFullyClose,
	)
}

// Called when openedPrice changes (settlement, ChargeFundingRate)
export function onPriceUpdate(
	event: ethereum.Event,
	version: Version,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	openAmount: BigInt,
	prevPrice: BigInt,
	newPrice: BigInt,
): void {
	if (prevPrice.equals(newPrice)) return
	let entity = getOrCreate(event, version, partyA, partyB, symbolId, positionType)
	if (entity.aggregatedAmount.isZero() && entity.openPositionsCount == 0) return
	// notional delta = openAmount * (newPrice - prevPrice)
	let delta = openAmount.times(newPrice.minus(prevPrice))
	entity.aggregatedNotional = entity.aggregatedNotional.plus(delta)
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}

// Called when SymbolAdjustment rewrites a quote's physical amount/price basis.
// The contract removes the old aggregate contribution and then adds the new one,
// so mirror both amount and weighted-funding changes instead of treating this as
// a price-only settlement.
export function onQuoteAdjustment(
	event: ethereum.Event,
	version: Version,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	oldOpenAmount: BigInt,
	newOpenAmount: BigInt,
	oldOpenedPrice: BigInt,
	newOpenedPrice: BigInt,
	accumulatedPaidFunding: BigInt,
): void {
	let entity = getOrCreate(event, version, partyA, partyB, symbolId, positionType)
	if (entity.aggregatedAmount.isZero() && entity.openPositionsCount == 0) return

	entity.aggregatedAmount = entity.aggregatedAmount.minus(oldOpenAmount).plus(newOpenAmount)
	entity.aggregatedNotional = entity.aggregatedNotional.minus(oldOpenAmount.times(oldOpenedPrice)).plus(newOpenAmount.times(newOpenedPrice))
	let oldFundingContribution = oldOpenAmount.times(accumulatedPaidFunding).div(FACTOR)
	let newFundingContribution = newOpenAmount.times(accumulatedPaidFunding).div(FACTOR)
	entity.weightedPaidFunding = entity.weightedPaidFunding.minus(oldFundingContribution).plus(newFundingContribution)
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}

// Called when accumulatedPaidFunding changes (ChargeAccumulatedFundingFee)
export function onFundingUpdate(
	event: ethereum.Event,
	version: Version,
	partyA: Address,
	partyB: Address,
	symbolId: BigInt,
	positionType: i32,
	openAmount: BigInt,
	prevFunding: BigInt,
	newFunding: BigInt,
): void {
	if (prevFunding.equals(newFunding)) return
	let entity = getOrCreate(event, version, partyA, partyB, symbolId, positionType)
	if (entity.aggregatedAmount.isZero() && entity.openPositionsCount == 0) return
	// delta = openAmount * (newFunding - prevFunding) / 1e18
	let oldContrib = openAmount.times(prevFunding).div(FACTOR)
	let newContrib = openAmount.times(newFunding).div(FACTOR)
	entity.weightedPaidFunding = entity.weightedPaidFunding.plus(newContrib.minus(oldContrib))
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}
