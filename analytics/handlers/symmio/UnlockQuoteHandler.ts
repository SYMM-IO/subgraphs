import {UnlockQuoteHandler as CommonUnlockQuoteHandler} from "../../../common/handlers/symmio/UnlockQuoteHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class UnlockQuoteHandler<T> extends CommonUnlockQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
