import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { QuoteStatus } from "../../../analytics/utils/constants"

export class ADLCloseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		quote.globalCounter = super.handleGlobalCounter()
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
	}
}
