import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { FundingFeeState } from "../../../generated/schema"
import { getFundingFeesOfPartyB as getFundingFeesOfPartyB_0_8_5 } from "../../common/contract_utils_0_8_5"
import { getFundingFeesOfPartyB as getFundingFeesOfPartyB_0_8_6 } from "../../common/contract_utils_0_8_6"
import { Version } from "../../common/BaseHandler"
import { resolveSymbolName } from "./symbol"

const FACTOR = BigInt.fromString("1000000000000000000")

function getEntityId(symbolId: BigInt, partyB: Address, source: Address): string {
	return symbolId.toString() + "-" + partyB.toHexString() + "-" + source.toHexString()
}

function initFundingFeeState(state: FundingFeeState): void {
	state.currentLongRate = BigInt.zero()
	state.currentShortRate = BigInt.zero()
	state.accumulatedLongRate = BigInt.zero()
	state.accumulatedShortRate = BigInt.zero()
	state.epochDuration = BigInt.zero()
	state.lastUpdatedEpoch = BigInt.zero()
	state.startEpoch = BigInt.zero()
	state.startEpochTimestamp = BigInt.zero()
	state.lastUpdatedTimestamp = BigInt.zero()
	state.snapshotLongFee = BigInt.zero()
	state.snapshotShortFee = BigInt.zero()
}

export function getOrCreateFundingFeeState(event: ethereum.Event, version: Version, symbolId: BigInt, partyB: Address): FundingFeeState {
	let id = getEntityId(symbolId, partyB, event.address)
	let state = FundingFeeState.load(id)
	if (!state) {
		state = new FundingFeeState(id)
		state.source = event.address
		state.symbolId = symbolId
		state.symbolName = resolveSymbolName(version, symbolId, event.address)
		state.partyB = partyB
		initFundingFeeState(state)
	} else if (state.symbolName.length == 0) {
		state.symbolName = resolveSymbolName(version, symbolId, event.address)
	}
	return state
}

export function enrichFundingFeeState(state: FundingFeeState, contractAddress: Address, version: Version): boolean {
	// Bind via the dispatching data source's own version so the ABI is always declared on it.
	if (version >= Version.v_0_8_6) {
		let info = getFundingFeesOfPartyB_0_8_6(contractAddress, state.symbolId, Address.fromBytes(state.partyB))
		if (!info) {
			log.warning("Failed to get funding fees for symbol {} partyB {}", [state.symbolId.toString(), state.partyB.toHexString()])
			return false
		}
		state.currentLongRate = info.currentLongRate
		state.currentShortRate = info.currentShortRate
		state.accumulatedLongRate = info.accumulatedLongRate
		state.accumulatedShortRate = info.accumulatedShortRate
		state.epochDuration = info.epochDuration
		state.lastUpdatedEpoch = info.lastUpdatedEpoch
		state.startEpoch = info.startEpoch
		state.startEpochTimestamp = info.startEpochTimeStamp
		state.lastUpdatedTimestamp = info.lastUpdatedTimeStamp
		state.snapshotLongFee = info.snapshotLongFee
		state.snapshotShortFee = info.snapshotShortFee
		return true
	}
	let info = getFundingFeesOfPartyB_0_8_5(contractAddress, state.symbolId, Address.fromBytes(state.partyB))
	if (!info) {
		log.warning("Failed to get funding fees for symbol {} partyB {}", [state.symbolId.toString(), state.partyB.toHexString()])
		return false
	}
	state.currentLongRate = info.currentLongRate
	state.currentShortRate = info.currentShortRate
	state.accumulatedLongRate = info.accumulatedLongRate
	state.accumulatedShortRate = info.accumulatedShortRate
	state.epochDuration = info.epochDuration
	state.lastUpdatedEpoch = info.lastUpdatedEpoch
	state.startEpoch = info.startEpoch
	state.startEpochTimestamp = info.startEpochTimeStamp
	state.lastUpdatedTimestamp = info.lastUpdatedTimeStamp
	state.snapshotLongFee = info.snapshotLongFee
	state.snapshotShortFee = info.snapshotShortFee
	return true
}

function getEpochOfTimestamp(timestamp: BigInt, epochDuration: BigInt): BigInt {
	if (epochDuration.isZero()) return BigInt.zero()
	return timestamp.div(epochDuration)
}

function scaleRate(rate: BigInt, marketPrice: BigInt): BigInt {
	return rate.times(marketPrice).div(FACTOR)
}

function updateAccumulatedRates(state: FundingFeeState, timestamp: BigInt): void {
	if (!state.epochDuration || state.epochDuration!.isZero()) return

	let currentEpoch = getEpochOfTimestamp(timestamp, state.epochDuration!)
	if (currentEpoch.lt(state.lastUpdatedEpoch!)) return

	let newEpochs = currentEpoch.minus(state.lastUpdatedEpoch!)
	let previousEpochs = state.lastUpdatedEpoch!.minus(state.startEpoch!)
	if (previousEpochs.isZero() && newEpochs.isZero()) return

	let totalEpochs = previousEpochs.plus(newEpochs)
	state.accumulatedLongRate = state.accumulatedLongRate!.times(previousEpochs).plus(state.currentLongRate!.times(newEpochs)).div(totalEpochs)
	state.accumulatedShortRate = state.accumulatedShortRate!.times(previousEpochs).plus(state.currentShortRate!.times(newEpochs)).div(totalEpochs)
	state.lastUpdatedEpoch = currentEpoch
	state.lastUpdatedTimestamp = timestamp
}

export function applySetEpochDurationToFundingFeeState(state: FundingFeeState, duration: BigInt, timestamp: BigInt): void {
	if (duration.isZero()) return

	if (state.epochDuration && !state.epochDuration!.isZero()) {
		updateAccumulatedRates(state, timestamp)

		let oldEpochCount = state.lastUpdatedEpoch!.minus(state.startEpoch!)
		state.snapshotLongFee = state.snapshotLongFee!.plus(state.accumulatedLongRate!.times(oldEpochCount))
		state.snapshotShortFee = state.snapshotShortFee!.plus(state.accumulatedShortRate!.times(oldEpochCount))

		let durationRatio = duration.times(FACTOR).div(state.epochDuration!)
		state.currentLongRate = state.currentLongRate!.times(durationRatio).div(FACTOR)
		state.currentShortRate = state.currentShortRate!.times(durationRatio).div(FACTOR)
		state.accumulatedLongRate = state.currentLongRate
		state.accumulatedShortRate = state.currentShortRate
		state.startEpochTimestamp = state.lastUpdatedTimestamp
		state.startEpoch = getEpochOfTimestamp(state.lastUpdatedTimestamp!, duration)
		state.lastUpdatedEpoch = state.startEpoch
	} else {
		state.lastUpdatedTimestamp = timestamp
		state.lastUpdatedEpoch = getEpochOfTimestamp(timestamp, duration)
	}

	state.epochDuration = duration
}

export function applyUpdateAccumulatedFundingFeeToFundingFeeState(
	state: FundingFeeState,
	rawLongRate: BigInt,
	rawShortRate: BigInt,
	marketPrice: BigInt,
	timestamp: BigInt,
): void {
	if (!state.epochDuration || state.epochDuration!.isZero()) return

	updateAccumulatedRates(state, timestamp)
	state.currentLongRate = scaleRate(rawLongRate, marketPrice)
	state.currentShortRate = scaleRate(rawShortRate, marketPrice)
	state.lastMarketPrice = marketPrice

	if (state.startEpoch!.isZero()) {
		state.startEpoch = getEpochOfTimestamp(timestamp, state.epochDuration!)
		state.startEpochTimestamp = timestamp
	}
}

export function applySetLongFundingFeeToFundingFeeState(state: FundingFeeState, rawLongRate: BigInt, marketPrice: BigInt, timestamp: BigInt): void {
	let rawShortRate = BigInt.zero()
	if (!marketPrice.isZero()) rawShortRate = state.currentShortRate!.times(FACTOR).div(marketPrice)
	applyUpdateAccumulatedFundingFeeToFundingFeeState(state, rawLongRate, rawShortRate, marketPrice, timestamp)
}

export function applySetShortFundingFeeToFundingFeeState(state: FundingFeeState, rawShortRate: BigInt, marketPrice: BigInt, timestamp: BigInt): void {
	let rawLongRate = BigInt.zero()
	if (!marketPrice.isZero()) rawLongRate = state.currentLongRate!.times(FACTOR).div(marketPrice)
	applyUpdateAccumulatedFundingFeeToFundingFeeState(state, rawLongRate, rawShortRate, marketPrice, timestamp)
}

export function isActiveFundingFeeState(state: FundingFeeState): boolean {
	return state.epochDuration !== null && !state.epochDuration!.isZero()
}

export function syncFundingFeeState(event: ethereum.Event, version: Version, symbolId: BigInt, partyB: Address): void {
	let state = getOrCreateFundingFeeState(event, version, symbolId, partyB)
	if (!enrichFundingFeeState(state, event.address, version)) return
	if (!isActiveFundingFeeState(state)) return
	state.updateTimestamp = event.block.timestamp
	state.save()
}
