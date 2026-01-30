import {
	DeferredLiquidatePartyAHandler as CommonDeferredLiquidatePartyAHandler
} from "../../../common/handlers/symmio/DeferredLiquidatePartyAHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DeferredLiquidatePartyAHandler<T> extends CommonDeferredLiquidatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
