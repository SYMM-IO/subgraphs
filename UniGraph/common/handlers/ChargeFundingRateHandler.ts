import { BaseHandler } from "./BaseHandler"
import { ChargeFundingRate } from "../../generated/symmio/symmio"
import { FACTOR, getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"
import { Quote } from "../../generated/schema"

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
			if (quote.positionType) { // SHORT position
				quote.openedPrice = quote.openedPrice!.minus(quote.openedPrice!.times(this.event.params.rates[i]).div(FACTOR))
			} else {
				quote.openedPrice = quote.openedPrice!.plus(quote.openedPrice!.times(this.event.params.rates[i]).div(FACTOR))
			}
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
				'ChargeFundingRate', this.event.transaction.hash)
		}

	}
}