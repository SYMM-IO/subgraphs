import { SendQuoteHandler as CommonSendQuoteHandler } from "../../common/handlers/SendQuoteHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { removeQuoteFromPendingList } from "../../common/utils/quote"

import { PartyA } from "../../generated/schema"
import { SendQuote } from "../../generated/symmio/symmio"

export class SendQuoteHandler extends CommonSendQuoteHandler {

	constructor(event: SendQuote) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()

		let event = super.getEvent()
		removeQuoteFromPendingList(event.params.quoteId)
	}
}
