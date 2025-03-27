import {LockQuoteHandler as CommonLockQuoteHandler} from "../../../common/handlers/symmio/LockQuoteHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LockQuoteHandler<T> extends CommonLockQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
