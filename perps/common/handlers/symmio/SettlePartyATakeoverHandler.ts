import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"

export class SettlePartyATakeoverHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		if (version < Version.v_0_8_5) return
		// @ts-ignore
		const event = changetype<T>(_event)
		let entityId = event.params.partyA.toHexString() + "-" + event.params.liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return
		entity.takeover = true
		entity.settled = true
		entity.fullyLiquidated = true
		entity.takeoverSettled = true
		entity.takeoverSettledTimestamp = _event.block.timestamp
		entity.fullyLiquidatedTimestamp = _event.block.timestamp
		entity.liquidationFee = BigInt.zero()
		entity.paidLf = BigInt.zero()
		entity.save()
	}
}
