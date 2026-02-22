import { BaseHandler, Version } from "../../../common/BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { FundingFeeState } from "../../../../generated/schema"

export class SetEpochDurationHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, len = event.params.symbolIds.length; i < len; i++) {
			let symbolId = event.params.symbolIds[i]
			let duration = event.params.durations[i]
			let partyB = event.params.partyB

			let stateId = symbolId.toString() + "-" + partyB.toHexString() + "-" + event.address.toHexString()
			let state = FundingFeeState.load(stateId)
			if (!state) {
				state = new FundingFeeState(stateId)
				state.source = event.address
				state.symbolId = symbolId
				state.partyB = partyB
				state.currentLongRate = null
				state.currentShortRate = null
				state.lastMarketPrice = null
			}
			state.epochDuration = duration
			state.updateTimestamp = event.block.timestamp
			state.save()
		}
	}
}
