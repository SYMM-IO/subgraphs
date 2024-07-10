import {
	DeallocateForPartyBHandler as CommonDeallocateForPartyBHandler
} from "../../../common/handlers/symmio/DeallocateForPartyBWithAccountHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DeallocateForPartyBHandler<T> extends CommonDeallocateForPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
