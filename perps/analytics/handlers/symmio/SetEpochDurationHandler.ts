import { BaseHandler, Version } from "../../../common/BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { enrichFundingFeeState, getOrCreateFundingFeeState } from "../../utils/fundingFeeState"
import { createFundingIndexCheckpoint } from "../../utils/fundingHistory"

export class SetEpochDurationHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, len = event.params.symbolIds.length; i < len; i++) {
			let symbolId = event.params.symbolIds[i]
			let duration = event.params.durations[i]
			let partyB = event.params.partyB

			let state = getOrCreateFundingFeeState(_event, version, symbolId, partyB)
			state.epochDuration = duration
			state.updateTimestamp = event.block.timestamp
			enrichFundingFeeState(state, event.address)
			state.save()
			createFundingIndexCheckpoint(_event, symbolId, partyB, "SET_EPOCH_DURATION", null, null, null, state, i)
		}
	}
}
