import { DistributeFromLiquidationEscrow as EventEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class DistributeFromLiquidationEscrowHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		const receivers: Bytes[] = []
		const allocationKeys: Bytes[] = []
		for (let i = 0; i < event.params.receivers.length; i++) receivers.push(event.params.receivers[i])
		for (let i = 0; i < event.params.allocationKeys.length; i++) allocationKeys.push(event.params.allocationKeys[i])
		entity.partyA = event.params.partyA
		entity.receivers = receivers
		entity.allocationKeys = allocationKeys
		entity.amounts = event.params.amounts
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
