import { log } from "@graphprotocol/graph-ts"
import { ExpireQuoteHandler as CommonExpireQuoteHandler } from "../../common/handlers/ExpireQuoteHandler"

import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { ExpireQuote } from "../../generated/symmio/symmio"
import { removeQuoteFromPendingList } from "../../common/utils/quote"

export class ExpireQuoteHandler extends CommonExpireQuoteHandler {

	constructor(event: ExpireQuote) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		let event = super.getEvent()
		removeQuoteFromPendingList(event.params.quoteId)

	}
}
