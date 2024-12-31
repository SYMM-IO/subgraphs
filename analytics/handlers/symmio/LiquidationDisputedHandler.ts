import {
	LiquidationDisputedHandler as CommonLiquidationDisputedHandler
} from "../../../common/handlers/symmio/LiquidationDisputedHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LiquidationDisputedHandler<T> extends CommonLiquidationDisputedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
