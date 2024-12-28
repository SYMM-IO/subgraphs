import {
	SetSymbolsPricesHandler as CommonSetSymbolsPricesHandler
} from "../../../common/handlers/symmio/SetSymbolsPricesHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolsPricesHandler<T> extends CommonSetSymbolsPricesHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
