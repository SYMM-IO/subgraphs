import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { Quote, QuotePriceUpdate } from "../../../../generated/schema"

export class SettleUpnlHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]

			let quote = Quote.load(data.quoteId.toString() + "-" + event.address.toHexString())!
			quote.openedPrice = event.params.updatedPrices[i]
			quote.save()

			let quote_price_update = new QuotePriceUpdate(
				data.quoteId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
			)
			quote_price_update.source = event.address
			quote_price_update.quoteId = data.quoteId
			quote_price_update.openQuantity = quote.quantity!.minus(quote.closedAmount!)
			quote_price_update.prevPrice = data.currentPrice
			quote_price_update.newPrice = event.params.updatedPrices[i]
			quote_price_update.type = "SettleUpnl"
			quote_price_update.timestamp = event.block.timestamp
			quote_price_update.save()

			setEventTimestampAndTransactionHashAndAction(quote, "SettleUpnl", _event)
		}
	}
}
