import { OperationalFeeAllowanceReductionRequested as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class OperationalFeeAllowanceReductionRequestedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.payer = event.params.payer
		entity.charger = event.params.charger
		entity.newAllowance = event.params.newAllowance
		entity.readyAt = event.params.readyAt
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
