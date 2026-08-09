import { PartyAReimbursementChange as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class PartyAReimbursementChangeHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyA = event.params.partyA
		entity.amount = event.params.amount
		entity.newBalance = event.params.newBalance
		entity._type = event.params._type
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
