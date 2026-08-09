import { OwnershipTransferred as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class OwnershipTransferredHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.previousOwner = event.params.previousOwner
		entity.newOwner = event.params.newOwner
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
