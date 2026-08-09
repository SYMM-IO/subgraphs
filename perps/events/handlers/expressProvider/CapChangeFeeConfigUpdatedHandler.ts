import { CapChangeFeeConfigUpdated as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { ExpressProviderVersion } from "../../../common/BaseHandler"
import { setRawExpressProviderEventMetadata } from "./rawEvent"

export class CapChangeFeeConfigUpdatedHandler<T> {
	handle(_event: ethereum.Event, version: ExpressProviderVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.feeToken = event.params.feeToken
		entity.feeAmount = event.params.feeAmount
		entity.feeReceiver = event.params.feeReceiver
		setRawExpressProviderEventMetadata(entity, _event)
		entity.save()
	}
}
