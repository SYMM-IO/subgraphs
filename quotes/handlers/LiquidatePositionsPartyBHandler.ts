import {
	LiquidatePositionsPartyBHandler as CommonLiquidatePositionsPartyBHandler
} from "../../common/handlers/LiquidatePositionsPartyBHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class LiquidatePositionsPartyBHandler<T> extends CommonLiquidatePositionsPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
