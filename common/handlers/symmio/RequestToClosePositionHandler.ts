import { BaseHandler, Version } from "../../BaseHandler"
import { DebugEntity, Quote } from "../../../generated/schema"
import { ethereum, log } from "@graphprotocol/graph-ts";
import { RequestToClosePosition as RequestToClosePosition_0_8_3 } from "../../../generated/symmio_0_8_3/symmio_0_8_3";
import {setEventTimestampAndTransactionHashAndAction} from "../../utils/quote";

export class RequestToClosePositionHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let quote = Quote.load(event.params.quoteId.toString())
		if (!quote) {  // TODO: remove after debug
			log.debug('quote not exist.(request to close position) quoteId={}', [event.params.quoteId.toString()])
			let db = new DebugEntity("RequestToClosePositionHandler")
			db.message = `quoteId ${event.params.quoteId.toString()} not exist`
			db.save()
			return
		}
		quote.globalCounter = super.handleGlobalCounter()
		quote.closePrice = event.params.closePrice
		quote.closeDeadline = event.params.deadline
		quote.orderTypeClose = event.params.orderType
		quote.quantityToClose = event.params.quantityToClose
		quote.quoteStatus = event.params.quoteStatus
		if (version == Version.v_0_8_3) {
			// @ts-ignore
			const e = changetype<RequestToClosePosition_0_8_3>(_event)
			quote.closeId = e.params.closeId
		}
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote, 'RequestToClosePosition', _event)
	}
}