import { RestatementInventoryPrepared as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class RestatementInventoryPreparedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.symbolId = event.params.symbolId
		entity.epoch = event.params.epoch
		entity.partyB = event.params.partyB
		entity.partyBRemainingLongAmount = event.params.partyBRemainingLongAmount
		entity.partyBRemainingShortAmount = event.params.partyBRemainingShortAmount
		entity.totalRemainingLongAmount = event.params.totalRemainingLongAmount
		entity.totalRemainingShortAmount = event.params.totalRemainingShortAmount
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
