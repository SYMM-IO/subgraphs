import {Quote} from "../../../generated/schema"
import {getQuote} from "../../utils"
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote&analitics&user"
import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts";

export class FillCloseRequestHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		let q = getQuote(event.params.quoteId, event.address)
		quote.cva = q.lockedValues.cva
		quote.partyAmm = q.lockedValues.partyAmm
		quote.partyBmm = q.lockedValues.partyBmm
		quote.lf = q.lockedValues.lf
		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.closedPrice = event.params.closedPrice
		quote.quoteStatus = event.params.quoteStatus
		quote.averageClosedPrice = (quote.closedAmount!.times(quote.averageClosedPrice!).plus(event.params.filledAmount.times(event.params.closedPrice))).div(quote.closedAmount!.plus(event.params.filledAmount))
		quote.closedAmount = quote.closedAmount!.plus(event.params.filledAmount)
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'FillCloseRequest', _event)
	}
}