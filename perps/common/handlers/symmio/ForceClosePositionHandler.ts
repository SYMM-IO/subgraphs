import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { DebugEntity, Quote } from "../../../../generated/schema"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"

export class ForceClosePositionHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			log.debug("quote not exist. quoteId {}", [event.params.quoteId.toString()])
			let db = new DebugEntity("ForceClosePosition-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quoteId ${event.params.quoteId.toString()} not exist`
			db.save()
			return
		}
		quote.globalCounter = super.handleGlobalCounter()
		let data = getQuoteData(version, event.address, event.params.quoteId)
		if (data) {
			quote.cva = data.cva
			quote.partyAmm = data.partyAmm
			quote.partyBmm = data.partyBmm
			quote.lf = data.lf
			quote.accumulatedPaidFunding = data.accumulatedPaidFunding
		}
		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.closedPrice = event.params.closedPrice
		let denominator = quote.closedAmount!.plus(event.params.filledAmount)
		if (denominator.gt(BigInt.zero())) {
			quote.averageClosedPrice = quote.closedAmount!.times(quote.averageClosedPrice!).plus(event.params.filledAmount.times(event.params.closedPrice)).div(denominator)
		}
		quote.closedAmount = quote.closedAmount!.plus(event.params.filledAmount)
		quote.quoteStatus = event.params.quoteStatus
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "ForceClosePosition", _event)
	}
}
