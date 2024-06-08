import { AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler } from "../../common/handlers/AcceptCancelRequestHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { removeQuoteFromPendingList } from "../../common/utils/quote"

import { PartyA, PartyBPartyA, Quote } from "../../generated/schema"
import { AcceptCancelRequest } from "../../generated/symmio/symmio"

export class AcceptCancelRequestHandler extends CommonAcceptCancelRequestHandler {

	constructor(event: AcceptCancelRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		let event = super.getEvent()
		removeQuoteFromPendingList(event.params.quoteId)
	}
}
