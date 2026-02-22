import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { QuoteStatus } from "../../../analytics/utils/constants"

export class ForceClosePartyBInsolventHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		quote.globalCounter = super.handleGlobalCounter()
		let fillAmount = quote.quantity!.minus(quote.closedAmount!)
		quote.closedPrice = event.params.closedPrice
		let denominator = quote.closedAmount!.plus(fillAmount)
		if (denominator.gt(BigInt.zero())) {
			quote.averageClosedPrice = quote
				.closedAmount!.times(quote.averageClosedPrice!)
				.plus(fillAmount.times(event.params.closedPrice))
				.div(denominator)
		}
		quote.closedAmount = quote.quantity
		quote.quoteStatus = QuoteStatus.CLOSED
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "ForceClosePartyBInsolvent", _event)
	}
}
