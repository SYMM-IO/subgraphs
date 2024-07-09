import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {
	ChargeFundingRateHandler as CommonChargeFundingRateHandler
} from "../../../common/handlers/symmio/ChargeFundingRateHandler"
import {FACTOR} from "../../../common/utils"
import {GlobalFee, Quote} from "../../../generated/schema"
import {setEventTimestampAndTransactionHashAndAction} from "../../../common/utils/quote&analitics&user"
import {Version} from "../../../common/BaseHandler";

export class ChargeFundingRateHandler<T> extends CommonChargeFundingRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			const rate = event.params.rates[i]
			let quote = Quote.load(quoteId.toString())!
			const openQuantityUntilNow = quote.quantity!.minus(quote.closedAmount!)
			let newPrice: BigInt
			if (quote.positionType === 0) { //Long
				newPrice = quote.openedPrice!.plus(quote.openedPrice!.times(rate).div(FACTOR))
			} else {
				newPrice = quote.openedPrice!.minus(quote.openedPrice!.times(rate).div(FACTOR))
			}
			let fee: BigInt
			fee = quote.openedPrice!.times(rate).times(openQuantityUntilNow).div(FACTOR).div(FACTOR)
			quote.fundingRateFee = fee.plus(quote.fundingRateFee!)
			quote.openedPrice = newPrice
			quote.globalCounter = super.handleGlobalCounter()
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'ChargeFundingRate', _event)

			let globalEntity = GlobalFee.load("GlobalEntity")
			if (!globalEntity) {
				globalEntity = new GlobalFee("GlobalEntity")
				globalEntity.globalFee = BigInt.fromI32(0)
			}
			globalEntity.globalFee = globalEntity.globalFee.plus(fee)
			globalEntity.latestTimestamp = event.block.timestamp
			globalEntity.save()
		}
	}
}
