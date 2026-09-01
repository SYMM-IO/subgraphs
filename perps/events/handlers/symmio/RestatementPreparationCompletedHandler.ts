import { RestatementPreparationCompleted as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class RestatementPreparationCompletedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.symbolId = event.params.symbolId
		entity.epoch = event.params.epoch
		entity.totalRemainingLongAmount = event.params.totalRemainingLongAmount
		entity.totalRemainingShortAmount = event.params.totalRemainingShortAmount
		entity.pendingFundingPartyBCount = event.params.pendingFundingPartyBCount
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
