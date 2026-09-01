import { SetSymbolMinAcceptableNotionalLFRate as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetSymbolMinAcceptableNotionalLFRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.symbolId = event.params.symbolId
		entity.oldMinAcceptableNotionalLFRate = event.params.oldMinAcceptableNotionalLFRate
		entity.newMinAcceptableNotionalLFRate = event.params.newMinAcceptableNotionalLFRate
		entity.hasOverride = event.params.hasOverride
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
