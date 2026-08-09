import { SetMuonFunctionUpnlValidTime as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetMuonFunctionUpnlValidTimeHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.func = event.params.func
		entity.enabled = event.params.enabled
		entity.upnlValidTime = event.params.upnlValidTime
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
