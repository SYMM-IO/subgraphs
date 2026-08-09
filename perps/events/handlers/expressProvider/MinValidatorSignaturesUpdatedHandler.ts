import { MinValidatorSignaturesUpdated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class MinValidatorSignaturesUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.affiliate = event.params.affiliate
		entity.minValidatorSignatures = event.params.minValidatorSignatures
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
