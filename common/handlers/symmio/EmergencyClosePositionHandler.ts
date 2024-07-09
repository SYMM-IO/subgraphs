import {BaseHandler, Version} from "../../BaseHandler"
import {Quote} from "../../../generated/schema"
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote&analitics&user"
import {ethereum} from "@graphprotocol/graph-ts";

export class EmergencyClosePositionHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.blockNumber = event.block.number
		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.closedPrice = event.params.closedPrice
		quote.quoteStatus = event.params.quoteStatus
		quote.averageClosedPrice = (quote.closedAmount!.times(quote.averageClosedPrice!).plus(event.params.filledAmount.times(event.params.closedPrice))).div(quote.closedAmount!.plus(event.params.filledAmount))
		quote.closedAmount = quote.closedAmount!.plus(event.params.filledAmount)
		quote.timeStamp = event.block.timestamp
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'EmergencyClosePosition', _event)
	}
}