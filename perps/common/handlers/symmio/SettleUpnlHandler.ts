import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { Quote } from "../../../../generated/schema"

export class SettleUpnlHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]

			let quote = Quote.load(data.quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue
			quote.globalCounter = super.handleGlobalCounter()
			quote.openedPrice = event.params.updatedPrices[i]
			quote.save()

			setEventTimestampAndTransactionHashAndAction(quote, "SettleUpnl", _event)
		}
	}
}
