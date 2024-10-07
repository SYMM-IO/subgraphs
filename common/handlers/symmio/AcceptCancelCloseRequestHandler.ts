import {BaseHandler, Version} from "../../BaseHandler"
import {Quote} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts"
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote";

export class AcceptCancelCloseRequestHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString())!
		quote.globalCounter = super.handleGlobalCounter()
		quote.quoteStatus = event.params.quoteStatus
		quote.blockNumber = event.block.number
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, 'AcceptCancelCloseRequest', _event)
	}
}