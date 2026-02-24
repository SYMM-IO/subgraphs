import { RequestToClosePositionHandler as CommonRequestToClosePositionHandler } from "../../../common/handlers/symmio/RequestToClosePositionHandler"
import { Account, Quote } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

import { updateActivityTimestamps } from "../../utils/activityHelpers"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"

export class RequestToClosePositionHandler<T> extends CommonRequestToClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		updateActivityTimestamps(account, event.block.timestamp, event.address)

		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		createQuoteEvent(
			_event,
			event.params.quoteId,
			"REQUEST_TO_CLOSE",
			new JSONBuilder()
				.add("closePrice", event.params.closePrice.toString())
				.add("quantityToClose", event.params.quantityToClose.toString())
				.add("orderType", event.params.orderType.toString())
				.addNullable("deadline", quote ? (quote.closeDeadline ? quote.closeDeadline!.toString() : null) : null)
				.build(),
		)
	}
}
