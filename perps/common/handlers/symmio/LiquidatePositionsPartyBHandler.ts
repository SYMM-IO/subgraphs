import { BaseHandler, Version } from "../../BaseHandler"
import { DebugEntity, Quote } from "../../../../generated/schema"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
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
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) {
				log.debug("quote not exist. quoteId {}", [quoteId.toString()])
				let db = new DebugEntity("LiqPositionsPartyB-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + i.toString())
				db.message = `quoteId ${quoteId.toString()} not exist`
				db.save()
				continue
			}
			quote.globalCounter = super.handleGlobalCounter()
			quote.liquidatedSide = 1
			quote.quoteStatus = 8

			let data = getQuoteData(version, event.address, quoteId)
			if (!data) {
				log.debug("getQuoteData null. quoteId {}", [quoteId.toString()])
				quote.save()
				setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsPartyB", _event)
				continue
			}
			let avgClosedPrice = data.avgClosedPrice

			quote.liquidateAmount = quote.quantity!.minus(quote.closedAmount!)
			if (quote.liquidateAmount!.gt(BigInt.zero())) {
				quote.liquidatePrice = avgClosedPrice
					.times(quote.quantity!)
					.minus(quote.averageClosedPrice!.times(quote.closedAmount!))
					.div(quote.liquidateAmount!)
			} else {
				quote.liquidatePrice = avgClosedPrice
			}
			quote.averageClosedPrice = avgClosedPrice
			quote.closedAmount = quote.quantity
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsPartyB", _event)
		}
	}
}
