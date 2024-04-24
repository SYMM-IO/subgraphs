import { BaseHandler } from "./BaseHandler"
import { OpenPosition } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class OpenPositionHandler extends BaseHandler {
	protected event: OpenPosition

	constructor(event: OpenPosition) {
		super(event)
		this.event = event
	}

	handle(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.quoteId = this.event.params.quoteId
		quote.fillAmount = this.event.params.filledAmount
		quote.openedPrice = this.event.params.openedPrice
		quote.quoteStatus = 4
		quote.timeStamp = this.event.block.timestamp
		quote.quantity = this.event.params.filledAmount
		quote.initialOpenedPrice = this.event.params.openedPrice
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'OpenPosition', this.event.transaction.hash)
		quote.save()
	}
}