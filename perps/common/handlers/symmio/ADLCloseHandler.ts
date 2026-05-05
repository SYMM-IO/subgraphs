import { BaseHandler, Version } from "../../BaseHandler"
import { Quote, SubAccount, VirtualAccount } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../VersionedQuoteLoader"
import { applyFundingTotalsFromAccumulatedFundingChange, setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { QuoteStatus } from "../../../analytics/utils/constants"

export class ADLCloseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		quote.globalCounter = super.handleGlobalCounter()
		let data = getQuoteData(version, event.address, event.params.quoteId)
		if (data) {
			quote.cva = data.cva
			quote.partyAmm = data.partyAmm
			quote.partyBmm = data.partyBmm
			quote.lf = data.lf
			applyFundingTotalsFromAccumulatedFundingChange(quote, data.accumulatedPaidFunding, quote.quantity!.minus(quote.closedAmount!))
			quote.accumulatedPaidFunding = data.accumulatedPaidFunding
			quote.lastFundingPaymentTimestamp = data.lastFundingPaymentTimestamp
		}
		quote.closedPrice = event.params.price
		let denominator = quote.closedAmount!.plus(event.params.amount)
		if (denominator.gt(BigInt.zero())) {
			quote.averageClosedPrice = quote
				.closedAmount!.times(quote.averageClosedPrice!)
				.plus(event.params.amount.times(event.params.price))
				.div(denominator)
		}
		quote.closedAmount = quote.closedAmount!.plus(event.params.amount)
		if (quote.quantity! == quote.closedAmount!) quote.quoteStatus = QuoteStatus.CLOSED
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "ADLClose", _event)

		if (quote.closedAmount!.equals(quote.quantity!)) {
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
