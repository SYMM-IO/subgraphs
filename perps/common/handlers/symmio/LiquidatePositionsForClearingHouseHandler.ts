import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"

export class LiquidatePositionsForClearingHouseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue
			quote.globalCounter = super.handleGlobalCounter()
			quote.liquidatedSide = 0
			quote.quoteStatus = 8

			let data = getQuoteData(version, event.address, quoteId)
			if (!data) continue
			let avgClosedPrice = data.avgClosedPrice
			quote.accumulatedPaidFunding = data.accumulatedPaidFunding

			quote.liquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			if (quote.liquidateAmount!.gt(BigInt.zero())) {
				quote.liquidatePrice = avgClosedPrice
					.times(quote.quantity!)
					.minus(quote.averageClosedPrice!.times(quote.closedAmount!))
					.div(quote.liquidateAmount!)
			} else {
				quote.liquidatePrice = avgClosedPrice
			}
			quote.averageClosedPrice = avgClosedPrice
			quote.closedAmount = quote.quantity
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsForClearingHouse", _event)
		}
	}
}
