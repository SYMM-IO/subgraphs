import { FullyLiquidatedPartyAHandler as CommonFullyLiquidatedPartyAHandler } from "../../../common/handlers/symmio/FullyLiquidatedPartyAHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createPartyALiquidationEvent, createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"
import { clearPartyALiquidationTracking, reconcileCompletedPartyALiquidation } from "../../utils/partyALiquidation"

export class FullyLiquidatedPartyAHandler<T> extends CommonFullyLiquidatedPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		if (version >= Version.v_0_8_3) {
			// Legacy generated events have no liquidationId field.
			let liquidationId = _event.parameters[1].value.toBytes()
			createPartyALiquidationEvent(_event, event.params.partyA, liquidationId, "FULLY_LIQUIDATED", null)
			if (version == Version.v_0_8_6) {
				reconcileCompletedPartyALiquidation(event.address, event.params.partyA, liquidationId)
				clearPartyALiquidationTracking(event.address, event.params.partyA)
			}
		} else {
			createPartyALiquidationEventFromState(_event, version, event.params.partyA, "FULLY_LIQUIDATED", null)
		}
	}
}
