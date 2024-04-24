import { Quote } from "../../generated/schema"
import { FillCloseRequest } from "../../generated/symmio/symmio"
import { getGlobalCounterAndInc, getQuote, setEventTimestampAndTransactionHashAndAction } from "../helper"
import { BaseHandler } from "./BaseHandler"

export class FillCloseRequestHandler extends BaseHandler {
	private event: FillCloseRequest

	constructor(event: FillCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()

		let q = getQuote(this.event.params.quoteId, this.event.address);
		quote.cva = q.lockedValues.cva
		quote.partyAmm = q.lockedValues.partyAmm
		quote.partyBmm = q.lockedValues.partyBmm
		quote.lf = q.lockedValues.lf

		quote.quoteId = this.event.params.quoteId
		quote.fillAmount = this.event.params.filledAmount
		quote.closedPrice = this.event.params.closedPrice
		quote.quoteStatus = this.event.params.quoteStatus
		quote.averageClosedPrice = (quote.closedAmount!.times(quote.averageClosedPrice!).plus(this.event.params.filledAmount.times(this.event.params.closedPrice))).div(quote.closedAmount!.plus(this.event.params.filledAmount))
		quote.closedAmount = quote.closedAmount!.plus(this.event.params.filledAmount)
		quote.timeStamp = this.event.block.timestamp
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'FillCloseRequest', this.event.transaction.hash)
		quote.save()
	}
}