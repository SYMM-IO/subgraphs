import { ClearingHouseSettlementComponent as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class ClearingHouseSettlementComponentHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.subject = event.params.subject
		entity.account = event.params.account
		entity.symbolId = event.params.symbolId
		entity.allocationKey = event.params.allocationKey
		entity.realizedPnl = event.params.realizedPnl
		entity.funding = event.params.funding
		entity.platformFee = event.params.platformFee
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
