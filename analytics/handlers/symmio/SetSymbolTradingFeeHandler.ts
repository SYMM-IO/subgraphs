import {ethereum} from "@graphprotocol/graph-ts";
import {
	SetSymbolTradingFeeHandler as CommonSetSymbolTradingFeeHandler
} from "../../../common/handlers/symmio/SetSymbolTradingFeeHandler";
import {Version} from "../../../common/BaseHandler";

export class SetSymbolTradingFeeHandler<T> extends CommonSetSymbolTradingFeeHandler<T> {
	handleSymbol(_event: ethereum.Event, version: Version): void {
		super.handleSymbol(_event, version)
	}
}