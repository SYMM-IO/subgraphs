import {ethereum} from "@graphprotocol/graph-ts"
import {ExpireQuoteHandler as CommonExpireQuoteHandler} from "../../common/handlers/ExpireQuoteHandler"
import {removeQuoteFromPendingList} from "../../common/utils/quote"
import {Version} from "../../common/BaseHandler";

export class ExpireQuoteHandler<T> extends CommonExpireQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		removeQuoteFromPendingList(event.params.quoteId)
	}
}
