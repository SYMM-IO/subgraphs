import {
	AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler
} from "../../../common/handlers/symmio/AcceptCancelRequestHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { createQuoteEvent } from "../../utils/quoteEvent"

export class AcceptCancelRequestHandler<T> extends CommonAcceptCancelRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		createQuoteEvent(_event, event.params.quoteId, "ACCEPT_CANCEL_QUOTE", null)
	}
}
