import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { FundingFeeState } from "../../../generated/schema"
import { getFundingFeesOfPartyB } from "../../common/contract_utils_0_8_5"

function getEntityId(symbolId: BigInt, partyB: Address, source: Address): string {
	return symbolId.toString() + "-" + partyB.toHexString() + "-" + source.toHexString()
}

function getOrCreateFundingFeeState(event: ethereum.Event, symbolId: BigInt, partyB: Address): FundingFeeState {
	let id = getEntityId(symbolId, partyB, event.address)
	let state = FundingFeeState.load(id)
	if (!state) {
		state = new FundingFeeState(id)
		state.source = event.address
		state.symbolId = symbolId
		state.partyB = partyB
	}
	return state
}

export function enrichFundingFeeState(state: FundingFeeState, contractAddress: Address): boolean {
	let info = getFundingFeesOfPartyB(contractAddress, state.symbolId, changetype<Address>(state.partyB))
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

export function syncFundingFeeState(event: ethereum.Event, symbolId: BigInt, partyB: Address): void {
	let state = getOrCreateFundingFeeState(event, symbolId, partyB)
	if (!enrichFundingFeeState(state, event.address)) return
	state.updateTimestamp = event.block.timestamp
	state.save()
}
