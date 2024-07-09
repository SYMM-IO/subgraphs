import {BaseHandler, Version} from "../../BaseHandler"
import {Quote} from "../../../generated/schema"
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote&analitics&user"
import {BigInt, ethereum, log} from "@graphprotocol/graph-ts"
import {getQuote} from "../../utils"

export class LiquidatePositionsPartyBHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString())!
			quote.globalCounter = super.handleGlobalCounter()
			quote.quoteStatus = 8
			const result = getQuote(quoteId, event.address)
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
			setEventTimestampAndTransactionHashAndAction(quote.eventsTimestamp, 'LiquidatePositionsPartyB', _event)
		}
	}
}