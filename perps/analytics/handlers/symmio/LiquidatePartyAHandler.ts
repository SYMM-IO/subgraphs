import {
	LiquidatePartyAHandlerWithAccount as CommonLiquidatePartyAHandler
} from "../../../common/handlers/symmio/LiquidatePartyAHandlerWithAccount"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LiquidatePartyAHandler<T> extends CommonLiquidatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
