import {ExpireQuoteCloseHandler as CommonExpireQuoteCloseHandler} from "../../../common/handlers/symmio/ExpireQuoteCloseHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class ExpireQuoteCloseHandler<T> extends CommonExpireQuoteCloseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
