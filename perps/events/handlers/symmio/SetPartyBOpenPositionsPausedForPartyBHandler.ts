import { SetPartyBOpenPositionsPausedForPartyB as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetPartyBOpenPositionsPausedForPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyB = event.params.partyB
		entity.status = event.params.status
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
