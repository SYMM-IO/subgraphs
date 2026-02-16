import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { AccountType, createNewAccountIfNotExists } from "../../utils/builders"

export class LiquidatePositionsPartyBHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version)
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = createNewAccountIfNotExists(event.params.liquidator, event.params.liquidator, null, AccountType.LIQUIDATOR, event.block, event.transaction)
		account.source = event.address
		account.save()
	}

	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())!
			quote.globalCounter = super.handleGlobalCounter()
			quote.liquidatedSide = 1
			quote.quoteStatus = 8

			let data = getQuoteData(version, event.address, quoteId)!
			let avgClosedPrice = data.avgClosedPrice

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
