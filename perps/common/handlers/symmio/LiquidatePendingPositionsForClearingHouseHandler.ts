import { BaseHandler, Version } from "../../BaseHandler"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Quote } from "../../../../generated/schema"
import { QuoteStatus } from "../../../analytics/utils/constants"
import { ClearingHouseLiquidationType, resolveClearingHouseLiquidationType } from "../../utils/clearingHouseLiquidation"
import {
	getClearingHouseLiquidatablePendingQuoteIds,
	removeQuoteFromPendingList,
	setEventTimestampAndTransactionHashAndAction,
} from "../../utils/quote"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

export function resolveClearingHousePendingQuoteIds(
	version: Version,
	source: Address,
	subject: Address,
	counterparties: Array<Address>,
	liquidatedAmountCount: i32,
): Array<BigInt> {
	let liquidationType = resolveClearingHouseLiquidationType(version, source, subject, liquidatedAmountCount)
	if (liquidationType == ClearingHouseLiquidationType.NONE) return new Array<BigInt>()
	return getClearingHouseLiquidatablePendingQuoteIds(
		subject,
		counterparties,
		source,
		liquidationType == ClearingHouseLiquidationType.PARTY_A_TAKEOVER,
	)
}

export class LiquidatePendingPositionsForClearingHouseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quoteIds = resolveClearingHousePendingQuoteIds(
			version,
			event.address,
			event.params.subject,
			event.params.counterparties,
			event.params.liquidatedAmounts.length,
		)
		this.handleQuoteIds(_event, quoteIds)
	}

	handleQuoteIds(_event: ethereum.Event, quoteIds: Array<BigInt>): void {
		// @ts-ignore
		const event = changetype<T>(_event)
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
