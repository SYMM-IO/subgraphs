import { BaseHandler, Version } from "../../BaseHandler"
import { DebugEntity, Quote } from "../../../../generated/schema"
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

export class ExpireQuoteOpenHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			log.debug("quote not exist.(expire quote open) quoteId={}", [event.params.quoteId.toString()])
			let db = new DebugEntity("ExpireQuoteOpen-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quoteId ${event.params.quoteId.toString()} not exist`
			db.save()
			return
		}
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteId = event.params.quoteId
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
		quote.quoteStatus = event.params.quoteStatus
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "ExpireQuote", _event)
	}
}
