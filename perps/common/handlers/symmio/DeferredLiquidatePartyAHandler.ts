import { BaseHandler, Version } from "../../BaseHandler";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { LiquidationDetail } from "../../../../generated/schema";

export class DeferredLiquidatePartyAHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entity = new LiquidationDetail(event.params.partyA.toHexString() + "-" + event.params.liquidationId.toString() + "-" + event.address.toHexString())
		entity.partyA = event.params.partyA
		entity.liquidationId = event.params.liquidationId
		entity.liquidationType = 0
		entity.upnl = event.params.upnl
		entity.totalUnrealizedLoss = event.params.totalUnrealizedLoss
		entity.deficit = BigInt.zero()
		entity.liquidationFee = BigInt.zero()
		// entity.timestamp = event.params.timestamp
		entity.involvedPartyBCounts = BigInt.zero()
		entity.partyAAccumulatedUpnl = BigInt.zero()
		entity.disputed = false
		entity.liquidationTimestamp = event.params.liquidationTimestamp
		entity.save()
	}
}