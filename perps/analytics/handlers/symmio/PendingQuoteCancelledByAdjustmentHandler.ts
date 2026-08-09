import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Quote } from "../../../../generated/schema"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { setEventTimestampAndTransactionHashAndAction } from "../../../common/utils/quote"
import { updateQuoteHierarchyCounters } from "../../../common/utils/profile"
import { QuoteStatus } from "../../utils/constants"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../utils/historyHelpers"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { markSymbolRestatementMutation } from "../../utils/symbolAdjustment"

export class PendingQuoteCancelledByAdjustmentHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return

		quote.globalCounter = super.handleGlobalCounter()
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
		quote.quoteStatus = QuoteStatus.EXPIRED
		setEventTimestampAndTransactionHashAndAction(quote, "PendingQuoteCancelledByAdjustment", _event)
		createQuoteEvent(
			_event,
			event.params.quoteId,
			"PENDING_QUOTE_CANCELLED_BY_ADJUSTMENT",
			new JSONBuilder().add("symbolId", event.params.symbolId.toString()).build(),
		)
		markSymbolRestatementMutation(_event, event.params.symbolId)
		updatePartyALatestBalance(_event, version, changetype<Address>(quote.partyA))
	}
}
