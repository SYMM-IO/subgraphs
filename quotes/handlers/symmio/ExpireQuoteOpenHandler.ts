import { ethereum } from "@graphprotocol/graph-ts"
import { ExpireQuoteOpenHandler as CommonExpireQuoteOpenHandler } from "../../../common/handlers/symmio/ExpireQuoteOpenHandler"
import { removeQuoteFromPendingList } from "../../../common/utils/quote"
import { Version } from "../../../common/BaseHandler";

export class ExpireQuoteOpenHandler<T> extends CommonExpireQuoteOpenHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		removeQuoteFromPendingList(event.params.quoteId)
	}
}
