import {
	RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler
} from "../../../common/handlers/symmio/RequestToCancelQuoteHandler"
import {removeQuoteFromPendingList} from "../../../common/utils/quote"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RequestToCancelQuoteHandler<T> extends CommonRequestToCancelQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		if (event.params.quoteStatus === 3) {
			removeQuoteFromPendingList(event.params.quoteId)
		}
	}
}
