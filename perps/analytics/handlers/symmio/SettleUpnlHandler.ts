
import { SettleUpnlHandler as CommonSettleUpnlHandler } from "../../../common/handlers/symmio/SettleUpnlHandler"
import { Address, ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { onPriceUpdate } from "../../utils/aggregatedPosition"

export class SettleUpnlHandler<T> extends CommonSettleUpnlHandler<T> {
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

			let openAmount = quote.quantity!.minus(quote.closedAmount!)
			onPriceUpdate(
				_event,
				event.params.partyA,
				changetype<Address>(quote.partyB!),
				quote.symbolId!,
				quote.positionType,
				openAmount,
				prevPrices[i],
				event.params.updatedPrices[i],
			)

			createQuoteEvent(
				_event,
				data.quoteId,
				"SETTLE_UPNL",
				new JSONBuilder()
					.add("prevPrice", prevPrices[i].toString())
					.add("newPrice", event.params.updatedPrices[i].toString())
					.add("openQuantity", openAmount.toString())
					.build(),
			)
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
		let seenPartyBs: Array<string> = []
		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]
			let quote = Quote.load(data.quoteId.toString() + "-" + event.address.toHexString())
			if (!quote || !quote.partyB) continue
			let partyBHex = quote.partyB!.toHexString()
			if (seenPartyBs.includes(partyBHex)) continue
			seenPartyBs.push(partyBHex)
			updatePartyBLatestBalance(_event, version, changetype<Address>(quote.partyB!), event.params.partyA)
		}
	}
}
