import { ForceCancelQuoteHandler as CommonForceCancelQuoteHandler } from "../../../common/handlers/symmio/ForceCancelQuoteHandler"
import { Address, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Quote } from "../../../../generated/schema"
import { createQuoteEvent } from "../../utils/quoteEvent"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { markSymbolRestatementMutation } from "../../utils/symbolAdjustment"

export class ForceCancelQuoteHandler<T> extends CommonForceCancelQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		if (quote.symbolId !== null) markSymbolRestatementMutation(_event, quote.symbolId!)
		createQuoteEvent(_event, event.params.quoteId, "FORCE_CANCEL_QUOTE", null)
		updatePartyALatestBalance(_event, version, changetype<Address>(quote.partyA))
	}
}
