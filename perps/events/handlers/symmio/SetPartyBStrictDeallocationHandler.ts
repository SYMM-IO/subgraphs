import { SetPartyBStrictDeallocation as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetPartyBStrictDeallocationHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyB = event.params.partyB
		entity.enabled = event.params.enabled
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
