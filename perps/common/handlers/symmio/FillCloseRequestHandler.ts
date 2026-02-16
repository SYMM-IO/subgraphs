import { DebugEntity, Quote } from "../../../../generated/schema"
import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { QuoteStatus } from "../../../analytics/utils/constants"

export class FillCloseRequestHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		let db = new DebugEntity("FillCloseRequestHandler common")
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) { //  TODO: remove after debug
			db.message = `quoteId: ${event.params.quoteId.toString()} not exist`
			db.save()
			return
		}
		quote.globalCounter = super.handleGlobalCounter()

		let data = getQuoteData(version, event.address, event.params.quoteId)
		if (!data) {
			db.message = `quoteId: ${event.params.quoteId.toString()} getQuote problem`
			db.save()
			return
		}
		quote.cva = data.cva
		quote.partyAmm = data.partyAmm
		quote.partyBmm = data.partyBmm
		quote.lf = data.lf

		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.closedPrice = event.params.closedPrice
		quote.averageClosedPrice = quote
			.closedAmount!.times(quote.averageClosedPrice!)
			.plus(event.params.filledAmount.times(event.params.closedPrice))
			.div(quote.closedAmount!.plus(event.params.filledAmount))
		quote.closedAmount = quote.closedAmount!.plus(event.params.filledAmount)
		if (quote.quantity! == quote.closedAmount!) quote.quoteStatus = QuoteStatus.CLOSED
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "FillCloseRequest", _event)
	}
}
