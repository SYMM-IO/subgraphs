import { SetLegacyPartyALiquidationDeprecated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetLegacyPartyALiquidationDeprecatedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.oldValue = event.params.oldValue
		entity.newValue = event.params.newValue
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
