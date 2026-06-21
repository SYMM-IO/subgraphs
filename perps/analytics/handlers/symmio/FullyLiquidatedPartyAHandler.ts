import { FullyLiquidatedPartyAHandler as CommonFullyLiquidatedPartyAHandler } from "../../../common/handlers/symmio/FullyLiquidatedPartyAHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createPartyALiquidationEvent, createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"

export class FullyLiquidatedPartyAHandler<T> extends CommonFullyLiquidatedPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		if (version >= Version.v_0_8_3) {
			createPartyALiquidationEvent(_event, event.params.partyA, event.params.liquidationId, "FULLY_LIQUIDATED", null)
		} else {
			createPartyALiquidationEventFromState(_event, version, event.params.partyA, "FULLY_LIQUIDATED", null)
		}
	}
}
