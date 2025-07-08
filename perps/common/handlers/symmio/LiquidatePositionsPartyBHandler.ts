import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuote as getQuote_0_8_0 } from "../../contract_utils_0_8_0"
import { getQuote as getQuote_0_8_1 } from "../../contract_utils_0_8_1"
import { getQuote as getQuote_0_8_2 } from "../../contract_utils_0_8_2"
import { getQuote as getQuote_0_8_3 } from "../../contract_utils_0_8_3"
import { getQuote as getQuote_0_8_4 } from "../../contract_utils_0_8_4"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"

export class LiquidatePositionsPartyBHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		createNewAccountIfNotExists(event.params.liquidator, event.params.liquidator, null, AccountType.LIQUIDATOR, event.block, event.transaction)
	}

	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString())!
			quote.globalCounter = super.handleGlobalCounter()
			quote.liquidatedSide = 1
			quote.quoteStatus = 8
			let avgClosedPrice: BigInt
			switch (version) {
				case Version.v_0_8_4: {
					let q = getQuote_0_8_4(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					break
				}
				case Version.v_0_8_3: {
					let q = getQuote_0_8_3(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					break
				}
				case Version.v_0_8_2: {
					let q = getQuote_0_8_2(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					break
				}
				case Version.v_0_8_1: {
					let q = getQuote_0_8_1(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					break
				}
				case Version.v_0_8_0: {
					let q = getQuote_0_8_0(event.address, quoteId)!
					avgClosedPrice = q.avgClosedPrice
					break
				}
			}
			quote.liquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			quote.liquidatePrice = avgClosedPrice
				.times(quote.quantity!)
				.minus(quote.averageClosedPrice!.times(quote.closedAmount!))
				.div(quote.liquidateAmount!)
			quote.averageClosedPrice = avgClosedPrice
			quote.closedAmount = quote.quantity
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsPartyB", _event)
		}
	}
}
