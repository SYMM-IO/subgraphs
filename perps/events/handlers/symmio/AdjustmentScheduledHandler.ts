import { AdjustmentScheduled as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class AdjustmentScheduledHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.symbolId = event.params.symbolId
		entity.adjustmentIndex = event.params.adjustmentIndex
		entity.factor = event.params.factor
		entity.effectiveTimestamp = event.params.effectiveTimestamp
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
