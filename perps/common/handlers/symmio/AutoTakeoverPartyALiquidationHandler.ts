import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"

export class AutoTakeoverPartyALiquidationHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		if (version < Version.v_0_8_5) return
		// @ts-ignore
		const event = changetype<T>(_event)
		let entityId = event.params.partyA.toHexString() + "-" + event.params.liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return
		entity.takeover = true
		entity.autoTakeover = true
		entity.takeoverTimestamp = _event.block.timestamp
		entity.takeoverSettled = false
		entity.disputed = false
		entity.liquidationFee = BigInt.zero()
		entity.save()
	}
}
