import { ethereum } from "@graphprotocol/graph-ts"
import { ExpireQuoteCloseHandler as CommonExpireQuoteClose } from "../../../common/handlers/symmio/ExpireQuoteCloseHandler"
import { removeQuoteFromPendingList } from "../../../common/utils/quote"
import { Version } from "../../../common/BaseHandler";

export class ExpireQuoteCloseHandler<T> extends CommonExpireQuoteClose<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		removeQuoteFromPendingList(event.params.quoteId)
	}
}
