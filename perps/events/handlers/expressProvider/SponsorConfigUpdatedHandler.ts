import { SponsorConfigUpdated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class SponsorConfigUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.affiliate = event.params.affiliate
		entity.maxFeePerWithdraw = event.params.maxFeePerWithdraw
		entity.maxWithdrawAmount = event.params.maxWithdrawAmount
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
