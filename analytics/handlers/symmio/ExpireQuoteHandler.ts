import {ExpireQuoteHandler as CommonExpireQuoteHandler} from "../../../common/handlers/symmio/ExpireQuoteHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class ExpireQuoteHandler<T> extends CommonExpireQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
