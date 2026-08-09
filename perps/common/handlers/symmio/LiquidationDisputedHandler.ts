import { BaseHandler, Version } from "../../BaseHandler"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"
import { getLiquidationStateData } from "../../VersionedQuoteLoader"

export class LiquidationDisputedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		if (version < Version.v_0_8_1) return

		let liquidationId: Bytes

		if (_event.parameters.length >= 2) {
			// v0.8.3+ appends liquidationId. Read it positionally so this
			// shared generic handler also compiles for the v0.8.1-v0.8.2
			// generated event types, where the named parameter does not exist.
			liquidationId = _event.parameters[1].value.toBytes()
		} else {
			// v0.8.1-v0.8.2: get from struct
			const liqState = getLiquidationStateData(version, event.address, event.params.partyA)
			if (!liqState) return
			liquidationId = liqState.liquidationId
		}

		let entityId = event.params.partyA.toHexString() + "-" + liquidationId.toHexString() + "-" + event.address.toHexString()
		let entity = LiquidationDetail.load(entityId)
		if (!entity) return

		entity.disputed = true
		entity.save()
	}
}
