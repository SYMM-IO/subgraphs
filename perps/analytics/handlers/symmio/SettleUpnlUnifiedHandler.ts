
import { SettleUpnlUnifiedHandler as CommonSettleUpnlUnifiedHandler } from "../../../common/handlers/symmio/SettleUpnlUnifiedHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote, SettleHistory } from "../../../../generated/schema"

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

			let settleHistory = new SettleHistory(
				data.quoteId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
			)
			settleHistory.source = event.address
			settleHistory.quoteId = data.quoteId
			settleHistory.quote = data.quoteId.toString() + "-" + event.address.toHexString()
			settleHistory.settleType = "SETTLE_UPNL_UNIFIED"
			settleHistory.prevPrice = prevPrices[i]
			settleHistory.newPrice = event.params.updatedPrices[i]
			settleHistory.openQuantity = quote.quantity!.minus(quote.closedAmount!)
			settleHistory.timestamp = event.block.timestamp
			settleHistory.blockNumber = event.block.number
			settleHistory.transaction = event.transaction.hash
			settleHistory.save()
		}
	}
}
