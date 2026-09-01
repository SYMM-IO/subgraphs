import { SetPartyBLiquidationOvershootRate as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetPartyBLiquidationOvershootRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyB = event.params.partyB
		entity.symbolId = event.params.symbolId
		entity.oldRate = event.params.oldRate
		entity.newRate = event.params.newRate
		entity.hasOverride = event.params.hasOverride
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
