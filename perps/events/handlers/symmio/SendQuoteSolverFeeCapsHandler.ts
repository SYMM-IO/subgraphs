import { SendQuoteSolverFeeCaps as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SendQuoteSolverFeeCapsHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyA = event.params.partyA
		entity.quoteId = event.params.quoteId
		entity.openRateCap = event.params.openRateCap
		entity.closeRateCap = event.params.closeRateCap
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
