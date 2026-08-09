import { AccumulatedFundingStateUpdated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class AccumulatedFundingStateUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.symbolId = event.params.symbolId
		entity.partyB = event.params.partyB
		entity.currentLongRate = event.params.currentLongRate
		entity.currentShortRate = event.params.currentShortRate
		entity.accumulatedLongRate = event.params.accumulatedLongRate
		entity.accumulatedShortRate = event.params.accumulatedShortRate
		entity.lastUpdatedEpoch = event.params.lastUpdatedEpoch
		entity.lastUpdatedTimeStamp = event.params.lastUpdatedTimeStamp
		entity.startEpochTimeStamp = event.params.startEpochTimeStamp
		entity.startEpoch = event.params.startEpoch
		entity.epochDuration = event.params.epochDuration
		entity.snapshotLongFee = event.params.snapshotLongFee
		entity.snapshotShortFee = event.params.snapshotShortFee
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
