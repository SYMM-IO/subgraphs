import { SettlePartyBUpnlForLiquidationHandler as CommonSettlePartyBUpnlForLiquidationHandler } from "../../../common/handlers/symmio/SettlePartyBUpnlForLiquidationHandler"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { onPriceUpdate } from "../../utils/aggregatedPosition"

export class SettlePartyBUpnlForLiquidationHandler<T> extends CommonSettlePartyBUpnlForLiquidationHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let prevPrices: Array<BigInt> = []
		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]
			let quote = Quote.load(data.quoteId.toString() + "-" + event.address.toHexString())
			prevPrices.push(quote !== null && quote.openedPrice !== null ? quote.openedPrice! : BigInt.zero())
		}

		this.handleQuote(_event, version)

		for (let i = 0; i < event.params.settlementData.length; i++) {
			let data = event.params.settlementData[i]
			let quote = Quote.load(data.quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue
			if (quote.quantity === null || quote.closedAmount === null || quote.symbolId === null) continue

			let openAmount = quote.quantity!.minus(quote.closedAmount!)
			onPriceUpdate(
				_event,
				version,
				changetype<Address>(quote.partyA),
				event.params.partyB,
				quote.symbolId!,
				quote.positionType,
				openAmount,
				prevPrices[i],
				event.params.updatedPrices[i],
			)

			createQuoteEvent(
				_event,
				data.quoteId,
				"SETTLE_PARTYB_UPNL_FOR_LIQUIDATION",
				new JSONBuilder()
					.add("liquidatedPartyA", event.params.liquidatedPartyA.toHexString())
					.add("prevPrice", prevPrices[i].toString())
					.add("newPrice", event.params.updatedPrices[i].toString())
					.add("openQuantity", openAmount.toString())
					.build(),
			)
		}

		for (let i = 0; i < event.params.partyAs.length; i++) {
			updatePartyALatestBalance(_event, version, event.params.partyAs[i])
		}
		updatePartyBLatestBalance(_event, version, event.params.partyB, Address.zero())
	}
}
