import { CloseAffiliatePositions as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class CloseAffiliatePositionsHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.affiliate = event.params.affiliate
		entity.quoteIds = event.params.quoteIds
		entity.closedAmounts = event.params.closedAmounts
		entity.prices = event.params.prices
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
