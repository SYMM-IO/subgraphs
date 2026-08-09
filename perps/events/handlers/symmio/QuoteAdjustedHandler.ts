import { QuoteAdjusted as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class QuoteAdjustedHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.quoteId = event.params.quoteId
		entity.symbolId = event.params.symbolId
		entity.epoch = event.params.epoch
		entity.factor = event.params.factor
		entity.oldQuantity = event.params.oldQuantity
		entity.newQuantity = event.params.newQuantity
		entity.oldOpenedPrice = event.params.oldOpenedPrice
		entity.newOpenedPrice = event.params.newOpenedPrice
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
