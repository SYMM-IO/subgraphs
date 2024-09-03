import {OpenPositionHandler as CommonOpenPositionHandler} from "../../../common/handlers/symmio/OpenPositionHandler"
import {removeQuoteFromPendingList} from "../../../common/utils/quote"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class OpenPositionHandler<T> extends CommonOpenPositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		removeQuoteFromPendingList(event.params.quoteId)
	}
}
