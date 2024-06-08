import { BaseHandler } from "./BaseHandler"
import { ChargeFundingRate } from "../../generated/symmio/symmio"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { Quote } from "../../generated/schema"
import { FACTOR, getGlobalCounterAndInc } from "../utils"

export class ChargeFundingRateHandler extends BaseHandler {
	protected event: ChargeFundingRate

	constructor(event: ChargeFundingRate) {
		super(event)
		this.event = event
	}

	protected getEvent(): ChargeFundingRate {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		for (let i = 0, lenQ = this.event.params.quoteIds.length; i < lenQ; i++) {
			let qoutId = this.event.params.quoteIds[i]
			let quote = Quote.load(qoutId.toString())!
			quote.globalCounter = getGlobalCounterAndInc()
			quote.blockNumber = this.event.block.number
			if (quote.positionType) { // SHORT position
				quote.openedPrice = quote.openedPrice!.minus(quote.openedPrice!.times(this.event.params.rates[i]).div(FACTOR))
			} else {
				quote.openedPrice = quote.openedPrice!.plus(quote.openedPrice!.times(this.event.params.rates[i]).div(FACTOR))
			}
			quote.timeStamp = this.event.block.timestamp
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
				'ChargeFundingRate', this.event.transaction.hash)
		}

	}
}