import { BaseHandler, Version } from "../../BaseHandler"
import { DebugEntity, Quote } from "../../../../generated/schema"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { QuoteStatus } from "../../../analytics/utils/constants"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

export class ExpireQuoteHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			log.debug("quote not exist.(expire quote) quoteId={}", [event.params.quoteId.toString()])
			let db = new DebugEntity("ExpireQuote-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quoteId ${event.params.quoteId.toString()} not exist`
			db.save()
			return
		}
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = event.params.quoteId
		if (event.params.quoteStatus == QuoteStatus.EXPIRED) {
			updateQuoteHierarchyCounters(
				quote,
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				_event.block.timestamp,
			)
			updateQuoteBucketHierarchyHistoriesForQuote(
				quote,
				_event.block.timestamp,
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
			)
		}
		quote.quoteStatus = event.params.quoteStatus
		if (event.params.quoteStatus == QuoteStatus.OPENED) {
			quote.quantityToClose = BigInt.zero()
			quote.closePrice = BigInt.zero()
		}
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "ExpireQuote", _event)
	}
}
