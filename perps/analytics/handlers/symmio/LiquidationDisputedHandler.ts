import { LiquidationDisputedHandler as CommonLiquidationDisputedHandler } from "../../../common/handlers/symmio/LiquidationDisputedHandler"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createPartyALiquidationEvent, createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"
import { LiquidationDisputed as LiquidationDisputed_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { LiquidationDisputed as LiquidationDisputed_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { LiquidationDisputed as LiquidationDisputed_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { LiquidationDisputed as LiquidationDisputed_0_8_6 } from "../../../../generated/symmio_0_8_6/symmio_0_8_6"

export class LiquidationDisputedHandler<T> extends CommonLiquidationDisputedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		if (version >= Version.v_0_8_3) {
			let liquidationId: Bytes
			if (version == Version.v_0_8_6) {
				// @ts-ignore
				liquidationId = changetype<LiquidationDisputed_0_8_6>(_event).params.liquidationId
			} else if (version == Version.v_0_8_5) {
				// @ts-ignore
				liquidationId = changetype<LiquidationDisputed_0_8_5>(_event).params.liquidationId
			} else if (version == Version.v_0_8_4) {
				// @ts-ignore
				liquidationId = changetype<LiquidationDisputed_0_8_4>(_event).params.liquidationId
			} else {
				// @ts-ignore
				liquidationId = changetype<LiquidationDisputed_0_8_3>(_event).params.liquidationId
			}
			createPartyALiquidationEvent(_event, event.params.partyA, liquidationId, "LIQUIDATION_DISPUTED", null)
		} else {
			createPartyALiquidationEventFromState(_event, version, event.params.partyA, "LIQUIDATION_DISPUTED", null)
		}
	}
}
