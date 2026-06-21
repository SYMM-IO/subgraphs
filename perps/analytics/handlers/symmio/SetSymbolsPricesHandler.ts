import { SetSymbolsPricesHandler as CommonSetSymbolsPricesHandler } from "../../../common/handlers/symmio/SetSymbolsPricesHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { createPartyALiquidationEventFromState } from "../../utils/liquidationEvent"

export class SetSymbolsPricesHandler<T> extends CommonSetSymbolsPricesHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		createPartyALiquidationEventFromState(_event, version, event.params.partyA, "SET_SYMBOLS_PRICE", null)
	}
}
