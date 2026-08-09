import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
	FundingFeeState,
	FundingIndexCheckpoint,
	LiquidationDetail,
	PartyALiquidationFundingSnapshot,
	Quote,
	QuoteFundingSettlement,
} from "../../../generated/schema"
import { Version } from "../../common/BaseHandler"
import { unDecimal } from "./common"
import { resolveSymbolName } from "./symbol"

export class FundingSettlementContext {
	found: boolean
	openAmount: BigInt
	previousAccumulatedPaidFunding: BigInt
	previousLastFundingPaymentTimestamp: BigInt

	constructor() {
		this.found = false
		this.openAmount = BigInt.zero()
		this.previousAccumulatedPaidFunding = BigInt.zero()
		this.previousLastFundingPaymentTimestamp = BigInt.zero()
	}
}

export class FundingSettlementAmount {
	found: boolean
	fundingDeltaPerUnit: BigInt
	signedAmount: BigInt

	constructor() {
		this.found = false
		this.fundingDeltaPerUnit = BigInt.zero()
		this.signedAmount = BigInt.zero()
	}
}

export function captureQuoteFundingContext(event: ethereum.Event, quoteId: BigInt): FundingSettlementContext {
	let context = new FundingSettlementContext()
	let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
	if (!quote || quote.quantity === null || quote.closedAmount === null) return context

	context.found = true
	context.openAmount = quote.quantity!.minus(quote.closedAmount!)
	context.previousAccumulatedPaidFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
	context.previousLastFundingPaymentTimestamp = quote.lastFundingPaymentTimestamp ? quote.lastFundingPaymentTimestamp! : BigInt.zero()
	return context
}

export function getQuoteFundingSignedAmount(quote: Quote, context: FundingSettlementContext | null): BigInt {
	if (context === null || !context.found) return BigInt.zero()
	let newAccumulatedPaidFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
	let fundingDeltaPerUnit = newAccumulatedPaidFunding.minus(context.previousAccumulatedPaidFunding)
	return unDecimal(fundingDeltaPerUnit.times(context.openAmount))
}

function partyALiquidationSnapshotId(source: Address, partyA: Address, liquidationId: Bytes, partyB: Address, symbolId: BigInt): string {
	return (
		source.toHexString() + "-" + partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + partyB.toHexString() + "-" + symbolId.toString()
	)
}

// PartyA liquidation settles unpaid funding transiently: core includes it in the
// settlement PnL but intentionally does not update quote.accumulatedPaidFunding.
// Reproduce the two authoritative core paths instead of deriving a post-close
// quote-field delta (which is always zero).
export function getPartyALiquidationFundingSettlement(
	event: ethereum.Event,
	version: Version,
	liquidationId: Bytes,
	quote: Quote,
	context: FundingSettlementContext,
): FundingSettlementAmount {
	let result = new FundingSettlementAmount()
	if (!context.found) return result
	if (version < Version.v_0_8_5) {
		result.found = true
		let currentFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
		result.fundingDeltaPerUnit = currentFunding.minus(context.previousAccumulatedPaidFunding)
		result.signedAmount = unDecimal(result.fundingDeltaPerUnit.times(context.openAmount))
		return result
	}
	if (quote.partyB === null || quote.symbolId === null) return result

	let partyA = Address.fromBytes(quote.partyA)
	let partyB = Address.fromBytes(quote.partyB!)
	let symbolId = quote.symbolId!
	let detail = LiquidationDetail.load(partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString())
	let snapshot = PartyALiquidationFundingSnapshot.load(partyALiquidationSnapshotId(event.address, partyA, liquidationId, partyB, symbolId))
	if (snapshot !== null && detail !== null) {
		result.found = true
		if (detail.liquidationTimestamp.le(context.previousLastFundingPaymentTimestamp)) return result
		let cumulativeFunding = quote.positionType == 0 ? snapshot.cumulativeLongFee : snapshot.cumulativeShortFee
		result.fundingDeltaPerUnit = cumulativeFunding.minus(context.previousAccumulatedPaidFunding)
		result.signedAmount = unDecimal(result.fundingDeltaPerUnit.times(context.openAmount))
		return result
	}

	// Legacy liquidation path uses the live symbol/PartyB funding state at the
	// liquidation transaction timestamp.
	let state = FundingFeeState.load(symbolId.toString() + "-" + partyB.toHexString() + "-" + event.address.toHexString())
	if (
		state === null ||
		state.epochDuration === null ||
		state.lastUpdatedEpoch === null ||
		state.startEpoch === null ||
		state.startEpochTimestamp === null ||
		state.currentLongRate === null ||
		state.currentShortRate === null ||
		state.accumulatedLongRate === null ||
		state.accumulatedShortRate === null ||
		state.snapshotLongFee === null ||
		state.snapshotShortFee === null
	) {
		return result
	}
	result.found = true
	if (state.epochDuration!.isZero()) return result
	if (state.startEpoch!.isZero() && state.startEpochTimestamp!.isZero()) return result
	if (event.block.timestamp.lt(state.startEpochTimestamp!)) return result
	if (event.block.timestamp.le(context.previousLastFundingPaymentTimestamp)) return result

	let currentEpoch = event.block.timestamp.div(state.epochDuration!)
	if (currentEpoch.lt(state.lastUpdatedEpoch!)) {
		result.found = false
		return result
	}
	let epochsSinceLastUpdate = currentEpoch.minus(state.lastUpdatedEpoch!)
	let epochsBeforeLastUpdate = state.lastUpdatedEpoch!.minus(state.startEpoch!)
	let accumulatedRate = quote.positionType == 0 ? state.accumulatedLongRate! : state.accumulatedShortRate!
	let currentRate = quote.positionType == 0 ? state.currentLongRate! : state.currentShortRate!
	let fundingSnapshot = quote.positionType == 0 ? state.snapshotLongFee! : state.snapshotShortFee!
	let cumulativeFunding = fundingSnapshot.plus(accumulatedRate.times(epochsBeforeLastUpdate)).plus(currentRate.times(epochsSinceLastUpdate))
	result.fundingDeltaPerUnit = cumulativeFunding.minus(context.previousAccumulatedPaidFunding)
	result.signedAmount = unDecimal(result.fundingDeltaPerUnit.times(context.openAmount))
	return result
}

function paidThroughEpoch(timestamp: BigInt, symbolId: BigInt, partyB: Address, source: Address): BigInt | null {
	let state = FundingFeeState.load(symbolId.toString() + "-" + partyB.toHexString() + "-" + source.toHexString())
	if (!state || !state.epochDuration || state.epochDuration!.isZero()) return null
	return timestamp.div(state.epochDuration!)
}

function saveQuoteFundingSettlement(
	event: ethereum.Event,
	version: Version,
	quoteId: BigInt,
	trigger: string,
	context: FundingSettlementContext,
	quote: Quote,
	newAccumulatedPaidFunding: BigInt,
	newLastFundingPaymentTimestamp: BigInt,
	fundingDeltaPerUnit: BigInt,
	signedAmount: BigInt,
	balanceChanged: boolean,
): void {
	let paidByPartyA = BigInt.zero()
	let receivedByPartyA = BigInt.zero()
	if (signedAmount.gt(BigInt.zero())) paidByPartyA = signedAmount
	else if (signedAmount.lt(BigInt.zero())) receivedByPartyA = signedAmount.abs()

	let partyB = Address.fromBytes(quote.partyB!)
	let symbolId = quote.symbolId!
	let entity = new QuoteFundingSettlement(event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + quoteId.toString())
	entity.source = event.address
	entity.quoteId = quoteId
	entity.quote = quote.id
	entity.partyA = quote.partyA
	entity.partyB = partyB
	entity.symbolId = symbolId
	entity.symbolName = resolveSymbolName(version, symbolId, event.address)
	entity.positionType = quote.positionType
	entity.trigger = trigger
	entity.openAmount = context.openAmount
	entity.previousAccumulatedPaidFunding = context.previousAccumulatedPaidFunding
	entity.newAccumulatedPaidFunding = newAccumulatedPaidFunding
	entity.fundingDeltaPerUnit = fundingDeltaPerUnit
	entity.signedAmount = signedAmount
	entity.paidByPartyA = paidByPartyA
	entity.receivedByPartyA = receivedByPartyA
	entity.previousLastFundingPaymentTimestamp = context.previousLastFundingPaymentTimestamp
	entity.newLastFundingPaymentTimestamp = newLastFundingPaymentTimestamp
	entity.previousPaidThroughEpoch = paidThroughEpoch(context.previousLastFundingPaymentTimestamp, symbolId, partyB, event.address)
	entity.newPaidThroughEpoch = paidThroughEpoch(newLastFundingPaymentTimestamp, symbolId, partyB, event.address)
	entity.balanceChanged = balanceChanged
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}

export function recordQuoteFundingSettlement(
	event: ethereum.Event,
	version: Version,
	quoteId: BigInt,
	trigger: string,
	context: FundingSettlementContext,
	balanceChanged: boolean,
): void {
	if (version < Version.v_0_8_5 || !context.found) return

	let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
	if (!quote || quote.partyB === null || quote.symbolId === null) return

	let newAccumulatedPaidFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
	let newLastFundingPaymentTimestamp = quote.lastFundingPaymentTimestamp ? quote.lastFundingPaymentTimestamp! : BigInt.zero()
	if (
		newAccumulatedPaidFunding.equals(context.previousAccumulatedPaidFunding) &&
		newLastFundingPaymentTimestamp.equals(context.previousLastFundingPaymentTimestamp)
	) {
		return
	}

	let fundingDeltaPerUnit = newAccumulatedPaidFunding.minus(context.previousAccumulatedPaidFunding)
	let signedAmount = getQuoteFundingSignedAmount(quote, context)
	saveQuoteFundingSettlement(
		event,
		version,
		quoteId,
		trigger,
		context,
		quote,
		newAccumulatedPaidFunding,
		newLastFundingPaymentTimestamp,
		fundingDeltaPerUnit,
		signedAmount,
		balanceChanged,
	)
}

export function recordTransientQuoteFundingSettlement(
	event: ethereum.Event,
	version: Version,
	quoteId: BigInt,
	trigger: string,
	context: FundingSettlementContext,
	settlement: FundingSettlementAmount,
): void {
	if (version < Version.v_0_8_5 || !context.found || !settlement.found) return
	if (settlement.fundingDeltaPerUnit.isZero() && settlement.signedAmount.isZero()) return
	let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
	if (!quote || quote.partyB === null || quote.symbolId === null) return
	let currentFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : context.previousAccumulatedPaidFunding
	let currentTimestamp = quote.lastFundingPaymentTimestamp ? quote.lastFundingPaymentTimestamp! : context.previousLastFundingPaymentTimestamp
	saveQuoteFundingSettlement(
		event,
		version,
		quoteId,
		trigger,
		context,
		quote,
		currentFunding,
		currentTimestamp,
		settlement.fundingDeltaPerUnit,
		settlement.signedAmount,
		false,
	)
}

export function createFundingIndexCheckpoint(
	event: ethereum.Event,
	symbolId: BigInt,
	partyB: Address,
	eventType: string,
	rawLongRate: BigInt | null,
	rawShortRate: BigInt | null,
	marketPrice: BigInt | null,
	state: FundingFeeState,
	index: i32,
): void {
	let entity = new FundingIndexCheckpoint(
		event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + index.toString() + "-" + eventType,
	)
	entity.source = event.address
	entity.symbolId = symbolId
	entity.symbolName = state.symbolName
	entity.partyB = partyB
	entity.eventType = eventType
	entity.rawLongRate = rawLongRate
	entity.rawShortRate = rawShortRate
	entity.marketPrice = marketPrice
	entity.currentLongRate = state.currentLongRate
	entity.currentShortRate = state.currentShortRate
	entity.accumulatedLongRate = state.accumulatedLongRate
	entity.accumulatedShortRate = state.accumulatedShortRate
	entity.epochDuration = state.epochDuration
	entity.lastUpdatedEpoch = state.lastUpdatedEpoch
	entity.startEpoch = state.startEpoch
	entity.startEpochTimestamp = state.startEpochTimestamp
	entity.lastUpdatedTimestamp = state.lastUpdatedTimestamp
	entity.snapshotLongFee = state.snapshotLongFee
	entity.snapshotShortFee = state.snapshotShortFee
	entity.timestamp = event.block.timestamp
	entity.blockNumber = event.block.number
	entity.transaction = event.transaction.hash
	entity.save()
}
