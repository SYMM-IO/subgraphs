import { QuoteFundingSettled as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class QuoteFundingSettledHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.quoteId = event.params.quoteId
		entity.symbolId = event.params.symbolId
		entity.partyB = event.params.partyB
		entity.partyA = event.params.partyA
		entity.allocationKey = event.params.allocationKey
		entity.funding = event.params.funding
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
