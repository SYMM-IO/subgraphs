import { BaseHandler, Version } from "../../BaseHandler"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Quote } from "../../../../generated/schema"
import { symmio_0_8_5 } from "../../../../generated/symmio_0_8_5/symmio_0_8_5"
import { QuoteStatus } from "../../../analytics/utils/constants"
import { getLiquidatablePendingQuoteIds, removeQuoteFromPendingList, setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

export function isPartyATakeoverSubject(version: Version, source: Address, subject: Address): bool {
	if (version < Version.v_0_8_5) return false
	let contract = symmio_0_8_5.bind(source)
	let cross = contract.try_getCrossLiquidationDetails(subject)
	if (!cross.reverted && cross.value.inProgress) return false
	let takeover = contract.try_getPartyATakeoverDetails(subject)
	return !takeover.reverted && takeover.value.inProgress
}

export class LiquidatePendingPositionsForClearingHouseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let counterparties: Address[] = isPartyATakeoverSubject(version, event.address, event.params.subject)
			? new Array<Address>()
			: event.params.counterparties
		let quoteIds = getLiquidatablePendingQuoteIds(event.params.subject, counterparties, event.address)
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
