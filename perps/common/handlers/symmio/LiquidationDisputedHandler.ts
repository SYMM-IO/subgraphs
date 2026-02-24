import { BaseHandler, Version } from "../../BaseHandler"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { LiquidationDetail } from "../../../../generated/schema"
import { LiquidationDisputed as LiquidationDisputed_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidationDisputed as LiquidationDisputed_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidationDisputed as LiquidationDisputed_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { getLiquidationStateData } from "../../VersionedQuoteLoader"

export class LiquidationDisputedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		if (version < Version.v_0_8_1) return

		let liquidationId: Bytes

		if (version >= Version.v_0_8_3) {
			if (version == Version.v_0_8_5) {
				// @ts-ignore
				const e = changetype<LiquidationDisputed_0_8_5>(_event)
				liquidationId = e.params.liquidationId
			} else if (version == Version.v_0_8_4) {
				// @ts-ignore
				const e = changetype<LiquidationDisputed_0_8_4>(_event)
				liquidationId = e.params.liquidationId
			} else {
				// @ts-ignore
				const e = changetype<LiquidationDisputed_0_8_3>(_event)
				liquidationId = e.params.liquidationId
			}
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
