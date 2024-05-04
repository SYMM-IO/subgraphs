import { BigInt } from "@graphprotocol/graph-ts"
import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../common/handlers/ChargeFundingRateHandler"
import { FACTOR } from "../../common/helper"
import { GlobalFee, Quote } from "../../generated/schema"
import { ChargeFundingRate } from "../../generated/symmio/symmio"

export class ChargeFundingRateHandler extends CommonChargeFundingRateHandler {

	constructor(event: ChargeFundingRate) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()

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

			quote.save()

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
