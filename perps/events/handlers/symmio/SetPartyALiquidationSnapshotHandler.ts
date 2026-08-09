import { SetPartyALiquidationSnapshot as EventEntity } from "../../../../generated/schema"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class SetPartyALiquidationSnapshotHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		const partyBs: Bytes[] = []
		for (let i = 0; i < event.params.partyBs.length; i++) partyBs.push(event.params.partyBs[i])
		entity.liquidator = event.params.liquidator
		entity.partyA = event.params.partyA
		entity.partyBs = partyBs
		entity.symbolIds = event.params.symbolIds
		entity.prices = event.params.prices
		entity.cumulativeLongFees = event.params.cumulativeLongFees
		entity.cumulativeShortFees = event.params.cumulativeShortFees
		entity.liquidationId = event.params.liquidationId
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
