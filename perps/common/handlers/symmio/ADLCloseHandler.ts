import { BaseHandler, Version } from "../../BaseHandler"
import { Quote } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"

export class ADLCloseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		quote.globalCounter = super.handleGlobalCounter()
		// Core emits FillCloseRequest immediately before ADLClose; the close state is already applied there.
		quote.closedPrice = event.params.price
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, "ADLClose", _event)
	}
}
