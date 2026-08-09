import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { GlobalFee, Quote } from "../../../../generated/schema"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { unDecimal } from "../../utils"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"

export class ChargeFundingRateHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			const rate = event.params.rates[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue
			if (quote.quantity === null || quote.closedAmount === null) continue
			let prevOpenedPrice = quote.openedPrice ? quote.openedPrice! : BigInt.zero()
			const openAmount = quote.quantity!.minus(quote.closedAmount!)

			let chainQuote = getQuoteData(version, event.address, quote.quoteId)
			if (!chainQuote) {
				quote.save()
				continue
			}
			let funding = unDecimal(chainQuote.openedPrice.minus(prevOpenedPrice).abs().times(openAmount))
			quote.openedPrice = chainQuote.openedPrice
			quote.lastFundingPaymentTimestamp = chainQuote.lastFundingPaymentTimestamp

			const paid = rate.gt(BigInt.zero())
			let fundingPaid = BigInt.zero()
			let fundingReceived = BigInt.zero()
			if (paid) fundingPaid = funding
			else fundingReceived = funding

			quote.userPaidFunding = (quote.userPaidFunding ? quote.userPaidFunding! : BigInt.zero()).plus(fundingPaid)
			quote.userReceivedFunding = (quote.userReceivedFunding ? quote.userReceivedFunding! : BigInt.zero()).plus(fundingReceived)
			quote.save()

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
