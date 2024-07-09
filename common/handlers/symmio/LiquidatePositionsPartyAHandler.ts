import {BaseHandler, Version} from "../../BaseHandler"
import {Quote} from "../../../generated/schema"
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote&analitics&user"
import {ethereum} from "@graphprotocol/graph-ts";

export class LiquidatePositionsPartyAHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString())!
			quote.quoteStatus = 8
			quote.liquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'LiquidatePositionsPartyA', _event)
		}
	}
}