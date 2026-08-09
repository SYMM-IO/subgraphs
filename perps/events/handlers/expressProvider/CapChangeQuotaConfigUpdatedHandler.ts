import { CapChangeQuotaConfigUpdated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class CapChangeQuotaConfigUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.maxFreePerWindow = event.params.maxFreePerWindow
		entity.windowDuration = event.params.windowDuration
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
