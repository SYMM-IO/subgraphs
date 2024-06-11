import { BaseHandler } from "./BaseHandler"
import { LiquidatePositionsPartyB, symmio } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { setEventTimestampAndTransactionHashAndAction } from "../utils/quote&analitics&user"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { getGlobalCounterAndInc, getQuote } from "../utils"

export class LiquidatePositionsPartyBHandler extends BaseHandler {
	protected event: LiquidatePositionsPartyB

	constructor(event: LiquidatePositionsPartyB) {
		super(event)
		this.event = event
	}

	protected getEvent(): LiquidatePositionsPartyB {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		for (let i = 0, lenQ = this.event.params.quoteIds.length; i < lenQ; i++) {
			let qouteId = this.event.params.quoteIds[i]
			let quote = Quote.load(qouteId.toString())!
			quote.globalCounter = getGlobalCounterAndInc()
			quote.quoteStatus = 8
			const result = getQuote(qouteId, this.event.address)
			const getclosedAmount = quote.quantity!
			let getAveragePrice = result[16].toBigInt()
			let LiquidateAmount = getclosedAmount.minus(quote.closedAmount!)
			quote.liquidateAmount = LiquidateAmount
			if (getAveragePrice.gt(BigInt.fromI32(0))) {
				quote.liquidatePrice = ((getAveragePrice.times(getclosedAmount)).minus(quote.averageClosedPrice!.times(quote.closedAmount!))).div(LiquidateAmount)
			} else {
				log.debug(`get total fill amount: ${getclosedAmount} , past total fill amount: ${quote.closedAmount!.toString()}\nQuoteId: ${quote.quoteId}`, [])
			}
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
				'LiquidatePositionsPartyB', this.event.transaction.hash, this.event.block.number)
		}
	}
}