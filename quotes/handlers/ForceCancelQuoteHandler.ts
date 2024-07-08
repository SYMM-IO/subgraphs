import {ForceCancelQuoteHandler as CommonForceCancelQuoteHandler} from "../../common/handlers/ForceCancelQuoteHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class ForceCancelQuoteHandler<T> extends CommonForceCancelQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
