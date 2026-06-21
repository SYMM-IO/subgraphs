import { LiquidatePartyAHandlerWithAccount as CommonLiquidatePartyAHandler } from "../../../common/handlers/symmio/LiquidatePartyAHandlerWithAccount"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"

export class LiquidatePartyAHandler<T> extends CommonLiquidatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		createPartyALiquidationEventFromState(_event, version, event.params.partyA, "LIQUIDATE_PARTY_A", null)
		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
