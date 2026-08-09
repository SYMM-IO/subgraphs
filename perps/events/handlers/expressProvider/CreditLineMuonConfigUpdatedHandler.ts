import { CreditLineMuonConfigUpdated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class CreditLineMuonConfigUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.signatureVerifier = event.params.signatureVerifier
		entity.muonAppId = event.params.muonAppId
		entity.muonFreshnessWindow = event.params.muonFreshnessWindow
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
