import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"

export class ResolveLiquidationDisputeHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		// Event exists from v0.8.3 onwards and always carries liquidationId + disputed fields.
		if (version < Version.v_0_8_3) return
		let entityId =
			event.params.partyA.toHexString() +
			"-" +
			event.params.liquidationId.toHexString() +
			"-" +
			event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return
		entity.disputed = event.params.disputed
		entity.save()
	}
}
