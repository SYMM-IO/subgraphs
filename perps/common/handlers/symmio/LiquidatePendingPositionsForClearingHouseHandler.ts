import { BaseHandler, Version } from "../../BaseHandler"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Quote } from "../../../../generated/schema"
import { QuoteStatus } from "../../../analytics/utils/constants"
import { getLiquidatablePendingQuoteIds, removeQuoteFromPendingList, setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

export class LiquidatePendingPositionsForClearingHouseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quoteIds = getLiquidatablePendingQuoteIds(event.params.subject, event.params.counterparties, event.address)
		for (let i = 0; i < quoteIds.length; i++) {
			let quoteId = quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			quote.globalCounter = super.handleGlobalCounter()
			quote.quoteStatus = QuoteStatus.LIQUIDATED_PENDING
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePendingPositionsForClearingHouse", _event)
			updateQuoteHierarchyCounters(
				quote,
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
				_event.block.timestamp,
			)
			updateQuoteBucketHierarchyHistoriesForQuote(
				quote,
				_event.block.timestamp,
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
			)
			removeQuoteFromPendingList(quoteId, event.address)
		}
	}
}
