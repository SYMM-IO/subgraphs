import { SettlePartyALiquidationHandler as CommonSettlePartyALiquidationHandler } from "../../../common/handlers/symmio/SettlePartyALiquidationHandler"
import { Bytes, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { createPartyALiquidationEvent, createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_3 } from "../../../../generated/symmio_0_8_3/symmio_0_8_3"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_4 } from "../../../../generated/symmio_0_8_4/symmio_0_8_4"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { SettlePartyALiquidation as SettlePartyALiquidation_0_8_6 } from "../../../../generated/symmio_0_8_6/symmio_0_8_6"

export class SettlePartyALiquidationHandler<T> extends CommonSettlePartyALiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		if (version >= Version.v_0_8_3) {
			let liquidationId: Bytes
			if (version == Version.v_0_8_6) {
				// @ts-ignore
				liquidationId = changetype<SettlePartyALiquidation_0_8_6>(_event).params.liquidationId
			} else if (version == Version.v_0_8_5) {
				// @ts-ignore
				liquidationId = changetype<SettlePartyALiquidation_0_8_5>(_event).params.liquidationId
			} else if (version == Version.v_0_8_4) {
				// @ts-ignore
				liquidationId = changetype<SettlePartyALiquidation_0_8_4>(_event).params.liquidationId
			} else {
				// @ts-ignore
				liquidationId = changetype<SettlePartyALiquidation_0_8_3>(_event).params.liquidationId
			}
			createPartyALiquidationEvent(_event, event.params.partyA, liquidationId, "SETTLE_PARTY_A", null)
		} else {
			createPartyALiquidationEventFromState(_event, version, event.params.partyA, "SETTLE_PARTY_A", null)
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
