import { SolverFeeCharged as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SolverFeeChargedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.quoteId = event.params.quoteId
		entity.partyA = event.params.partyA
		entity.partyB = event.params.partyB
		entity.receiver = event.params.receiver
		entity.symbolId = event.params.symbolId
		entity.feeType = event.params.feeType
		entity.amount = event.params.amount
		entity.tag = event.params.tag
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
