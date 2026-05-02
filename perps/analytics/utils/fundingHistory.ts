import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { FundingFeeState, FundingIndexCheckpoint, Quote, QuoteFundingSettlement } from "../../../generated/schema"
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

function paidThroughEpoch(timestamp: BigInt, symbolId: BigInt, partyB: Address, source: Address): BigInt | null {
	let state = FundingFeeState.load(symbolId.toString() + "-" + partyB.toHexString() + "-" + source.toHexString())
	if (!state || !state.epochDuration || state.epochDuration!.isZero()) return null
	return timestamp.div(state.epochDuration!)
}

export function recordQuoteFundingSettlement(
	event: ethereum.Event,
	version: Version,
	quoteId: BigInt,
	trigger: string,
	context: FundingSettlementContext,
	balanceChanged: boolean,
): void {
	if (version != Version.v_0_8_5 || !context.found) return

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
	let signedAmount = unDecimal(fundingDeltaPerUnit.times(context.openAmount))
	let paidByPartyA = BigInt.zero()
	let receivedByPartyA = BigInt.zero()
	if (signedAmount.gt(BigInt.zero())) paidByPartyA = signedAmount
	else if (signedAmount.lt(BigInt.zero())) receivedByPartyA = signedAmount.abs()

	let partyB = changetype<Address>(quote.partyB!)
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
