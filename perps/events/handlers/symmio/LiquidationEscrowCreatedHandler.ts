import { LiquidationEscrowCreated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class LiquidationEscrowCreatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyA = event.params.partyA
		entity.liquidationId = event.params.liquidationId
		entity.amount = event.params.amount
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
