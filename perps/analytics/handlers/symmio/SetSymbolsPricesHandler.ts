import { SetSymbolsPricesHandler as CommonSetSymbolsPricesHandler } from "../../../common/handlers/symmio/SetSymbolsPricesHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createPartyALiquidationEvent, createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"

export class SetSymbolsPricesHandler<T> extends CommonSetSymbolsPricesHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		if (version >= Version.v_0_8_3) {
			// v0.8.3+ carries the lifecycle key. Contract reads execute against
			// end-of-block state and may already expose a later liquidation.
			let liquidationId = _event.parameters[4].value.toBytes()
			createPartyALiquidationEvent(_event, event.params.partyA, liquidationId, "SET_SYMBOLS_PRICE", null)
		} else {
			createPartyALiquidationEventFromState(_event, version, event.params.partyA, "SET_SYMBOLS_PRICE", null)
		}
	}
}
