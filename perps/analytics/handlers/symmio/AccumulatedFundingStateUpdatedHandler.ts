import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getOrCreateFundingFeeState } from "../../utils/fundingFeeState"

export class AccumulatedFundingStateUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let state = getOrCreateFundingFeeState(_event, version, event.params.symbolId, event.params.partyB)
		state.currentLongRate = event.params.currentLongRate
		state.currentShortRate = event.params.currentShortRate
		state.accumulatedLongRate = event.params.accumulatedLongRate
		state.accumulatedShortRate = event.params.accumulatedShortRate
		state.lastUpdatedEpoch = event.params.lastUpdatedEpoch
		state.lastUpdatedTimestamp = event.params.lastUpdatedTimeStamp
		state.startEpochTimestamp = event.params.startEpochTimeStamp
		state.startEpoch = event.params.startEpoch
		state.epochDuration = event.params.epochDuration
		state.snapshotLongFee = event.params.snapshotLongFee
		state.snapshotShortFee = event.params.snapshotShortFee
		state.updateTimestamp = event.block.timestamp
		state.save()
	}
}
