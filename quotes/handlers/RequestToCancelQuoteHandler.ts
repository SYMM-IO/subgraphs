import { RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler } from "../../common/handlers/RequestToCancelQuoteHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { removeQuoteFromPendingList } from "../../common/utils/quote"

import { PartyA, Quote } from "../../generated/schema"
import { RequestToCancelQuote } from "../../generated/symmio/symmio"

export class RequestToCancelQuoteHandler extends CommonRequestToCancelQuoteHandler {

	constructor(event: RequestToCancelQuote) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		if (this.event.params.quoteStatus === 3) {
			let event = super.getEvent()
			removeQuoteFromPendingList(event.params.quoteId)
		}
	}
}
