import { BigInt } from "@graphprotocol/graph-ts"
import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../common/handlers/ChargeFundingRateHandler"
import { FACTOR, getGlobalCounterAndInc } from "../../common/utils"
import { GlobalFee, Quote } from "../../generated/schema"
import { ChargeFundingRate } from "../../generated/symmio/symmio"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"

export class ChargeFundingRateHandler extends CommonChargeFundingRateHandler {

	constructor(event: ChargeFundingRate) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		const event = super.getEvent()
		for (let i = 0, lenQ = this.event.params.quoteIds.length; i < lenQ; i++) {
			let qoutId = this.event.params.quoteIds[i]
			const rate = this.event.params.rates[i]
			let quote = Quote.load(qoutId.toString())!
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
			quote.globalCounter = getGlobalCounterAndInc()
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, event.block.timestamp,
				'ChargeFundingRate', event.transaction.hash, event.block.number)

			let globalEntity = GlobalFee.load("GlobalEntity")
			if (!globalEntity) {
				globalEntity = new GlobalFee("GlobalEntity")
				globalEntity.globalFee = BigInt.fromI32(0)
			}
			globalEntity.globalFee = globalEntity.globalFee.plus(fee)
			globalEntity.latestTimestamp = this.event.block.timestamp
			globalEntity.save()
		}
	}
}
