import {ethereum} from "@graphprotocol/graph-ts";
import {
	SetSymbolTradingFeeHandler as CommonSetSymbolTradingFeeHandler
} from "../../../common/handlers/symmio/SetSymbolTradingFeeHandler";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolTradingFeeHandler<T> extends CommonSetSymbolTradingFeeHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}