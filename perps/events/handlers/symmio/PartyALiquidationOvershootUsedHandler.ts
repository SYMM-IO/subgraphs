import { PartyALiquidationOvershootUsed as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class PartyALiquidationOvershootUsedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.quoteId = event.params.quoteId
		entity.partyA = event.params.partyA
		entity.partyB = event.params.partyB
		entity.symbolId = event.params.symbolId
		entity.rate = event.params.rate
		entity.allowedShortfall = event.params.allowedShortfall
		entity.actualShortfall = event.params.actualShortfall
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
