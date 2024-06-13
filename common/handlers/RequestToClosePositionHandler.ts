import { BaseHandler } from "./BaseHandler"
import { RequestToClosePosition } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { getGlobalCounterAndInc } from "../utils"

export class RequestToClosePositionHandler extends BaseHandler {
	protected event: RequestToClosePosition

	constructor(event: RequestToClosePosition) {
		super(event)
		this.event = event
	}

	protected getEvent(): RequestToClosePosition {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.closePrice = this.event.params.closePrice
		quote.closeDeadline = this.event.params.deadline
		quote.orderTypeClose = this.event.params.orderType
		quote.quantityToClose = this.event.params.quantityToClose
		quote.quoteStatus = this.event.params.quoteStatus
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'RequestToClosePosition', this.event.transaction.hash, this.event.block.number)
	}
}