import { BaseHandler } from "./BaseHandler"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"

export class LiquidatePositionsPartyAHandler extends BaseHandler {
	protected event: LiquidatePositionsPartyA

	constructor(event: LiquidatePositionsPartyA) {
		super(event)
		this.event = event
	}

	protected getEvent(): LiquidatePositionsPartyA {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		const event = this.event
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let qoutId = event.params.quoteIds[i]
			let quote = Quote.load(qoutId.toString())!
			quote.quoteStatus = 8
			let LiquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			quote.liquidateAmount = LiquidateAmount
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, event.block.timestamp,
				'LiquidatePositionsPartyA', event.transaction.hash, event.block.number)

		}
	}
}