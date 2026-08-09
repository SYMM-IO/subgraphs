import { SponsorCoverageRestored as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class SponsorCoverageRestoredHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.user = event.params.user
		entity.requestId = event.params.requestId
		entity.affiliate = event.params.affiliate
		entity.restored = event.params.restored
		entity.shortfall = event.params.shortfall
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
