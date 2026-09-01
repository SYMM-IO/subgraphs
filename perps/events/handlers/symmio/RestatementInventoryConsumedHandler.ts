import { RestatementInventoryConsumed as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class RestatementInventoryConsumedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.symbolId = event.params.symbolId
		entity.epoch = event.params.epoch
		entity.quoteId = event.params.quoteId
		entity.partyB = event.params.partyB
		entity.positionType = event.params.positionType
		entity.consumedAmount = event.params.consumedAmount
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
