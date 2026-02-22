
import { ChargeAccumulatedFundingFeeHandler as CommonChargeAccumulatedFundingFeeHandler } from "../../../common/handlers/symmio/ChargeAccumulatedFundingFeeHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { FundingHistory, Quote } from "../../../../generated/schema"

export class ChargeAccumulatedFundingFeeHandler<T> extends CommonChargeAccumulatedFundingFeeHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		this.handleQuote(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			let fundingHistory = new FundingHistory(
				quoteId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
			)
			fundingHistory.source = event.address
			fundingHistory.quoteId = quoteId
			fundingHistory.quote = quoteId.toString() + "-" + event.address.toHexString()
			fundingHistory.fundingType = "CHARGE_ACCUMULATED_FUNDING_FEE"
			fundingHistory.rate = null
			fundingHistory.fundingPaid = BigInt.zero()
			fundingHistory.fundingReceived = BigInt.zero()
			fundingHistory.prevPrice = quote.openedPrice!
			fundingHistory.newPrice = quote.openedPrice!
			fundingHistory.openQuantity = quote.quantity!.minus(quote.closedAmount!)
			fundingHistory.timestamp = event.block.timestamp
			fundingHistory.blockNumber = event.block.number
			fundingHistory.transaction = event.transaction.hash
			fundingHistory.save()
		}
	}
}
