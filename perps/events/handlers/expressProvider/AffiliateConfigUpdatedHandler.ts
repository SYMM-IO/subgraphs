import { AffiliateConfigUpdated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class AffiliateConfigUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.affiliate = event.params.affiliate
		entity.feeRate = event.params.feeRate
		entity.operatorFee = event.params.operatorFee
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
