import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Quote } from "../../../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"

export class SettlePartyBUpnlForLiquidationHandler<T> extends BaseHandler {
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

			setEventTimestampAndTransactionHashAndAction(quote, "SettlePartyBUpnlForLiquidation", _event)
		}
	}
}
