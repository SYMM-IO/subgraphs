import { DebugEntity, Quote, SubAccount, VirtualAccount } from "../../../../generated/schema"
import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { applyFundingTotalsFromAccumulatedFundingChange, setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { QuoteStatus } from "../../../analytics/utils/constants"
import { updateQuoteHierarchyCounters } from "../../utils/profile"
import { updateQuoteBucketHierarchyHistoriesForQuote } from "../../../analytics/utils/historyHelpers"

function isClosePendingStatus(status: i32): boolean {
	return status == QuoteStatus.CLOSE_PENDING || status == QuoteStatus.CANCEL_CLOSE_PENDING
}

export class FillCloseRequestHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			let db = new DebugEntity("FillCloseRequest-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quoteId: ${event.params.quoteId.toString()} not exist`
			db.save()
			return
		}
		quote.globalCounter = super.handleGlobalCounter()

		let data = getQuoteData(version, event.address, event.params.quoteId)
		if (!data) {
			let db = new DebugEntity("FillCloseRequest-getQuote-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quoteId: ${event.params.quoteId.toString()} getQuote problem`
			db.save()
			return
		}
		quote.cva = data.cva
		quote.partyAmm = data.partyAmm
		quote.partyBmm = data.partyBmm
		quote.lf = data.lf
		applyFundingTotalsFromAccumulatedFundingChange(quote, data.accumulatedPaidFunding, quote.quantity!.minus(quote.closedAmount!))
		quote.accumulatedPaidFunding = data.accumulatedPaidFunding
		quote.lastFundingPaymentTimestamp = data.lastFundingPaymentTimestamp

		quote.quoteId = event.params.quoteId
		quote.fillAmount = event.params.filledAmount
		quote.closedPrice = event.params.closedPrice
		let denominator = quote.closedAmount!.plus(event.params.filledAmount)
		if (denominator.gt(BigInt.zero())) {
			quote.averageClosedPrice = quote
				.closedAmount!.times(quote.averageClosedPrice!)
				.plus(event.params.filledAmount.times(event.params.closedPrice))
				.div(denominator)
		}
		quote.closedAmount = quote.closedAmount!.plus(event.params.filledAmount)
		quote.quoteStatus = event.params.quoteStatus
		if (isClosePendingStatus(event.params.quoteStatus)) {
			quote.quantityToClose = quote.quantityToClose!.minus(event.params.filledAmount)
		} else {
			quote.quantityToClose = BigInt.zero()
			quote.closePrice = BigInt.zero()
		}
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "FillCloseRequest", _event)

		if (quote.closedAmount!.equals(quote.quantity!)) {
			updateQuoteHierarchyCounters(
				quote,
				BigInt.zero(),
				BigInt.fromI32(-1),
				BigInt.fromI32(1),
				BigInt.zero(),
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
				BigInt.fromI32(1),
				BigInt.zero(),
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
