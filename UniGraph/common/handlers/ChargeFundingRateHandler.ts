import { BaseHandler } from "./BaseHandler"
import { ChargeFundingRate } from "../../generated/symmio/symmio"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"
import { Quote } from "../../generated/schema"
import { FACTOR } from "result-quote/src/helper"

export class ChargeFundingRateHandler extends BaseHandler {
	private event: ChargeFundingRate

	constructor(event: ChargeFundingRate) {
		super(event)
		this.event = event
	}

	handle(): void {
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