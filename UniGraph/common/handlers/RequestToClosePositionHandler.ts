import { BaseHandler } from "./BaseHandler"
import { RequestToClosePosition } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"

export class RequestToClosePositionHandler extends BaseHandler {
	protected event: RequestToClosePosition

	constructor(event: RequestToClosePosition) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
		let quote = Quote.load(this.event.params.quoteId.toString())!
		quote.globalCounter = getGlobalCounterAndInc()
		quote.closePrice = this.event.params.closePrice
		quote.closeDeadline = this.event.params.deadline
		quote.orderTypeClose = this.event.params.orderType
		quote.partyA = this.event.params.partyA
		quote.partyB = this.event.params.partyB
		quote.quantityToClose = this.event.params.quantityToClose
		quote.quoteId = this.event.params.quoteId
		quote.quoteStatus = this.event.params.quoteStatus
		quote.timeStamp = this.event.block.timestamp
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
			'LiquidatePositionsPartyB', this.event.transaction.hash)
	}
}