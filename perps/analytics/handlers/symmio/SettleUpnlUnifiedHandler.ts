
import { SettleUpnlUnifiedHandler as CommonSettleUpnlUnifiedHandler } from "../../../common/handlers/symmio/SettleUpnlUnifiedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"

export class SettleUpnlUnifiedHandler<T> extends CommonSettleUpnlUnifiedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		// Capture pre-update openedPrices before common handler modifies Quote
		let prevPrices: Array<BigInt> = []
		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]
			let quote = Quote.load(data.quoteId.toString() + "-" + event.address.toHexString())
			prevPrices.push(quote ? quote.openedPrice! : BigInt.zero())
		}

		this.handleQuote(_event, version)

		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]
			let quote = Quote.load(data.quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			createQuoteEvent(
				_event,
				data.quoteId,
				"SETTLE_UPNL_UNIFIED",
				new JSONBuilder()
					.add("prevPrice", prevPrices[i].toString())
					.add("newPrice", event.params.updatedPrices[i].toString())
					.add("openQuantity", quote.quantity!.minus(quote.closedAmount!).toString())
					.build(),
			)
		}
	}
}
