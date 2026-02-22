import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { GlobalFee, Quote, QuotePriceUpdate } from "../../../../generated/schema";
import { getQuoteData } from "../../VersionedQuoteLoader"
import { unDecimal } from "../../utils"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote";

export class ChargeFundingRateHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			const rate = event.params.rates[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue
			let quote_price_update = new QuotePriceUpdate(quoteId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString())
			quote_price_update.quoteId = quoteId
			quote_price_update.source = event.address
			let prevOpenedPrice = quote.openedPrice ? quote.openedPrice! : BigInt.zero()
			quote_price_update.prevPrice = prevOpenedPrice
			quote_price_update.type = "ChargeFundingRate"
			quote_price_update.timestamp = event.block.timestamp
			const openAmount = quote.quantity!.minus(quote.closedAmount!)
			quote_price_update.openQuantity = openAmount

			let chainQuote = getQuoteData(version, event.address, quote.quoteId)
			if (!chainQuote) {
				quote.save()
				continue
			}
			quote_price_update.newPrice = chainQuote.openedPrice
			let funding = unDecimal(chainQuote.openedPrice.minus(prevOpenedPrice).abs().times(openAmount))
			quote.openedPrice = chainQuote.openedPrice

			const paid = rate.gt(BigInt.zero())
			let fundingPaid = BigInt.zero()
			let fundingReceived = BigInt.zero()
			if (paid) fundingPaid = funding
			else fundingReceived = funding

			quote.userPaidFunding = quote.userPaidFunding!.plus(fundingPaid)
			quote.userReceivedFunding = quote.userReceivedFunding!.plus(fundingReceived)
			quote.save()
			quote_price_update.save()

			let globalEntity = GlobalFee.load("GlobalEntity")
			if (!globalEntity) {
				globalEntity = new GlobalFee("GlobalEntity")
				globalEntity.globalFee = BigInt.zero()
			}
			globalEntity.latestTimestamp = event.block.timestamp
			if (!paid) globalEntity.globalFee = globalEntity.globalFee.plus(funding)
			else globalEntity.globalFee = globalEntity.globalFee.minus(funding)
			globalEntity.save()
			setEventTimestampAndTransactionHashAndAction(quote, "ChargeFundingRate", _event)
		}
	}
}
