import { OwnershipTransferStarted as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class OwnershipTransferStartedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.currentOwner = event.params.currentOwner
		entity.pendingOwner = event.params.pendingOwner
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
