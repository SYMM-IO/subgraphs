import { TakeoverPartyALiquidationHandler as CommonTakeoverPartyALiquidationHandler } from "../../../common/handlers/symmio/TakeoverPartyALiquidationHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { activatePartyATakeover } from "../../../common/utils/clearingHouseLiquidation"
import { createPartyALiquidationEvent } from "../../utils/liquidationEvent"

export class TakeoverPartyALiquidationHandler<T> extends CommonTakeoverPartyALiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		if (version >= Version.v_0_8_5) activatePartyATakeover(event.address, event.params.partyA)
		createPartyALiquidationEvent(_event, event.params.partyA, event.params.liquidationId, "TAKEOVER", null)
	}
}
