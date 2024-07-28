import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote&analitics&user"
import { ethereum } from "@graphprotocol/graph-ts";

export class RequestToClosePositionHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.closePrice = event.params.closePrice
		quote.closeDeadline = event.params.deadline
		quote.orderTypeClose = event.params.orderType
		quote.quantityToClose = event.params.quantityToClose
		quote.quoteStatus = event.params.quoteStatus
		if (version == Version.v_0_8_3) {
			quote.closeId = event.params.closeId
		}
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'RequestToClosePosition', _event)
	}
}