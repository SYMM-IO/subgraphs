import { LiquidatePartyAHandlerWithAccount as CommonLiquidatePartyAHandler } from "../../../common/handlers/symmio/LiquidatePartyAHandlerWithAccount"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { createPartyALiquidationEvent, createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"
import { startPartyALiquidationTracking } from "../../utils/partyALiquidation"

export class LiquidatePartyAHandler<T> extends CommonLiquidatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		if (version >= Version.v_0_8_3) {
			let liquidationId = _event.parameters[5].value.toBytes()
			if (version == Version.v_0_8_6) startPartyALiquidationTracking(_event, event.params.partyA, liquidationId)
			createPartyALiquidationEvent(_event, event.params.partyA, liquidationId, "LIQUIDATE_PARTY_A", null)
		} else {
			createPartyALiquidationEventFromState(_event, version, event.params.partyA, "LIQUIDATE_PARTY_A", null)
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
