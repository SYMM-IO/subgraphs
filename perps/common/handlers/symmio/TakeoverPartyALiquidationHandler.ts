import { BaseHandler, Version } from "../../BaseHandler"
import { LiquidationDetail } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"

export class TakeoverPartyALiquidationHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let entityId = event.params.partyA.toHexString() + "-" + event.params.liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return
		entity.takeover = true
		entity.autoTakeover = false
		entity.takeoverTimestamp = event.params.timestamp
		entity.takeoverSettled = false
		entity.disputed = false
		entity.liquidationFee = BigInt.zero()
		entity.paidLf = BigInt.zero()
		entity.save()
	}
}
