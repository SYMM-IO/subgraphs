import { SetSolverFeeReceiverForTag as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetSolverFeeReceiverForTagHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyB = event.params.partyB
		entity.receiver = event.params.receiver
		entity.tag = event.params.tag
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
