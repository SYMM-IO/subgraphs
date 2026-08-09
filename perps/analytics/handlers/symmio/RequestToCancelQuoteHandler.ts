import { RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler } from "../../../common/handlers/symmio/RequestToCancelQuoteHandler"
import { Account, Quote } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

import { updateActivityTimestamps } from "../../utils/activityHelpers"
import { createQuoteEvent } from "../../utils/quoteEvent"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { QuoteStatus } from "../../utils/constants"
import { markSymbolRestatementMutation } from "../../utils/symbolAdjustment"

export class RequestToCancelQuoteHandler<T> extends CommonRequestToCancelQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		if (event.params.quoteStatus == QuoteStatus.CANCELED) {
			let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
			if (quote !== null && quote.symbolId !== null) markSymbolRestatementMutation(_event, quote.symbolId!)
		}

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		updateActivityTimestamps(account, event.block.timestamp, event.address)

		createQuoteEvent(_event, event.params.quoteId, "REQUEST_TO_CANCEL_QUOTE", null)

		updatePartyALatestBalance(_event, version, event.params.partyA)
	}
}
