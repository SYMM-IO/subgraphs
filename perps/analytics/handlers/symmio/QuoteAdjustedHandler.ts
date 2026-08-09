import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Quote } from "../../../../generated/schema"
import { BaseHandler, Version } from "../../../common/BaseHandler"
import { getQuoteData } from "../../../common/VersionedQuoteLoader"
import { setEventTimestampAndTransactionHashAndAction } from "../../../common/utils/quote"
import { onQuoteAdjustment } from "../../utils/aggregatedPosition"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { markSymbolRestatementMutation } from "../../utils/symbolAdjustment"

export class QuoteAdjustedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return

		let previousClosedAmount = quote.closedAmount === null ? BigInt.zero() : quote.closedAmount!
		let previousOpenAmount = event.params.oldQuantity.minus(previousClosedAmount)
		let data = getQuoteData(version, event.address, event.params.quoteId)
		if (!data) return
		let newOpenAmount = data.quantity.minus(data.closedAmount)

		if (quote.partyB) {
			onQuoteAdjustment(
				_event,
				version,
				changetype<Address>(quote.partyA),
				changetype<Address>(quote.partyB!),
				event.params.symbolId,
				quote.positionType,
				previousOpenAmount,
				newOpenAmount,
				event.params.oldOpenedPrice,
				event.params.newOpenedPrice,
				data.accumulatedPaidFunding,
			)
		}

		quote.globalCounter = super.handleGlobalCounter()
		quote.quantity = data.quantity
		quote.openedPrice = data.openedPrice
		quote.initialOpenedPrice = data.initialOpenedPrice
		quote.requestedOpenPrice = data.requestedOpenPrice
		quote.marketPrice = data.marketPrice
		quote.closedAmount = data.closedAmount
		quote.averageClosedPrice = data.avgClosedPrice
		quote.quantityToClose = data.quantityToClose
		quote.closePrice = data.requestedClosePrice
		quote.accumulatedPaidFunding = data.accumulatedPaidFunding
		quote.lastFundingPaymentTimestamp = data.lastFundingPaymentTimestamp
		quote.lastAdjustmentEpoch = event.params.epoch
		quote.lastAdjustmentFactor = event.params.factor
		setEventTimestampAndTransactionHashAndAction(quote, "QuoteAdjusted", _event)

		createQuoteEvent(
			_event,
			event.params.quoteId,
			"QUOTE_ADJUSTED",
			new JSONBuilder()
				.add("symbolId", event.params.symbolId.toString())
				.add("epoch", event.params.epoch.toString())
				.add("factor", event.params.factor.toString())
				.add("oldQuantity", event.params.oldQuantity.toString())
				.add("newQuantity", event.params.newQuantity.toString())
				.add("oldOpenedPrice", event.params.oldOpenedPrice.toString())
				.add("newOpenedPrice", event.params.newOpenedPrice.toString())
				.build(),
		)
		markSymbolRestatementMutation(_event, event.params.symbolId)
	}
}
