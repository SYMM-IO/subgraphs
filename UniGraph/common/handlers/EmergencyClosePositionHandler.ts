import { BaseHandler } from "./BaseHandler"
import { EmergencyClosePosition } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class EmergencyClosePositionHandler extends BaseHandler {
	protected event: EmergencyClosePosition

	constructor(event: EmergencyClosePosition) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.fillAmount = this.event.params.filledAmount
		quote.closedPrice = this.event.params.closedPrice
		quote.quoteStatus = this.event.params.quoteStatus
		quote.averageClosedPrice = (quote.closedAmount!.times(quote.averageClosedPrice!).plus(this.event.params.filledAmount.times(this.event.params.closedPrice))).div(quote.closedAmount!.plus(this.event.params.filledAmount))
		quote.closedAmount = quote.closedAmount!.plus(this.event.params.filledAmount)
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'EmergencyClosePosition', this.event.transaction.hash)
		quote.save()
	}
}