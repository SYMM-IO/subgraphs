import { BaseHandler } from "./BaseHandler"
import { LiquidatePositionsPartyB, symmio } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"
import { getGlobalCounterAndInc, setEventTimestampAndTransactionHashAndAction } from "../helper"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"

export class LiquidatePositionsPartyBHandler extends BaseHandler {
	protected event: LiquidatePositionsPartyB

	constructor(event: LiquidatePositionsPartyB) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
		for (let i = 0, lenQ = this.event.params.quoteIds.length; i < lenQ; i++) {
			let qoutId = this.event.params.quoteIds[i]
			let quote = Quote.load(qoutId.toString())!
			quote.globalCounter = getGlobalCounterAndInc()
			quote.timeStamp = this.event.block.timestamp
			quote.quoteStatus = 8
			let symmioContract = symmio.bind(this.event.address)
			let callResult = symmioContract.try_getQuote(qoutId)
			if (callResult.reverted) {
				log.error('liquidate bind crashed!', [])
			} else {
				const Result = callResult.value as ethereum.Tuple
				const getclosedAmount = quote.quantity!
				let getAveragePrice = Result[16].toBigInt()
				let LiquidateAmount = getclosedAmount.minus(quote.closedAmount!)
				quote.liquidateAmount = LiquidateAmount
				if (getAveragePrice.gt(BigInt.fromI32(0))) {
					quote.liquidatePrice = ((getAveragePrice.times(getclosedAmount)).minus(quote.averageClosedPrice!.times(quote.closedAmount!))).div(LiquidateAmount)
				} else {
					log.debug(`get total fill amount: ${getclosedAmount} , past total fill amount: ${quote.closedAmount!.toString()}\nQuoteId: ${quote.quoteId}`, [])
				}
			}
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, this.event.block.timestamp,
				'LiquidatePositionsPartyB', this.event.transaction.hash)
		}
	}
}