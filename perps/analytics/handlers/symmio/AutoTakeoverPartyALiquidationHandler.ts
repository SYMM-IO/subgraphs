import { AutoTakeoverPartyALiquidationHandler as CommonAutoTakeoverPartyALiquidationHandler } from "../../../common/handlers/symmio/AutoTakeoverPartyALiquidationHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createPartyALiquidationEvent } from "../../utils/liquidationEvent"

export class AutoTakeoverPartyALiquidationHandler<T> extends CommonAutoTakeoverPartyALiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		if (version >= Version.v_0_8_5) createPartyALiquidationEvent(_event, event.params.partyA, event.params.liquidationId, "AUTO_TAKEOVER", null)
	}
}
