import { OwnershipTransferStarted as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class OwnershipTransferStartedHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.currentOwner = event.params.currentOwner
		entity.pendingOwner = event.params.pendingOwner
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
