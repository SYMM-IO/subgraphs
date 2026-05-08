import { BaseHandler, Version } from "../../BaseHandler"
import { Quote, SubAccount, VirtualAccount } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

export class LiquidatePositionsForClearingHouseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue
			quote.globalCounter = super.handleGlobalCounter()
			if (quote.partyB !== null && quote.partyB!.equals(event.params.subject)) {
				quote.liquidatedSide = 1
			} else {
				quote.liquidatedSide = 0
			}
			quote.quoteStatus = 8

			let data = getQuoteData(version, event.address, quoteId)
			if (!data) continue
			let avgClosedPrice = data.avgClosedPrice
			quote.accumulatedPaidFunding = data.accumulatedPaidFunding
			quote.lastFundingPaymentTimestamp = data.lastFundingPaymentTimestamp

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
			quote.quantityToClose = BigInt.zero()
			quote.closePrice = BigInt.zero()
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote, "LiquidatePositionsForClearingHouse", _event)
			updateQuoteHierarchyCounters(
				quote,
				BigInt.zero(),
				BigInt.fromI32(-1),
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
				BigInt.zero(),
				BigInt.fromI32(-1),
				BigInt.zero(),
				BigInt.fromI32(1),
				BigInt.zero(),
				BigInt.zero(),
				BigInt.zero(),
			)

			if (quote.subAccount) {
				let sub = SubAccount.load(quote.subAccount!)
				if (sub) {
					sub.activePositions = sub.activePositions.minus(BigInt.fromI32(1))
					sub.save()
				}
			}
			if (quote.virtualAccount) {
				let va = VirtualAccount.load(quote.virtualAccount!)
				if (va) {
					va.activePositions = va.activePositions.minus(BigInt.fromI32(1))
					va.save()
				}
			}
		}
	}
}
