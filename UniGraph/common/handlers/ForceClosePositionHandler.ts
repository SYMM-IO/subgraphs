import { BaseHandler } from "./BaseHandler"
import { ForceClosePosition } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class ForceClosePositionHandler extends BaseHandler {
	protected event: ForceClosePosition

	constructor(event: ForceClosePosition) {
		super(event)
		this.event = event
	}

	protected getEvent(): ForceClosePosition {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.fillAmount = this.event.params.filledAmount
		quote.closedPrice = this.event.params.closedPrice
		quote.averageClosedPrice = (quote.closedAmount!.times(quote.averageClosedPrice!).plus(this.event.params.filledAmount.times(this.event.params.closedPrice))).div(quote.closedAmount!.plus(this.event.params.filledAmount))
		quote.closedAmount = quote.closedAmount!.plus(this.event.params.filledAmount)
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'ForceClosePosition', this.event.transaction.hash)

		quote.save()
	}
}