import { OpenPositionHandler as CommonOpenPositionHandler } from "../../common/handlers/OpenPositionHandler"
import { getGlobalCounterAndInc } from "../../common/utils"
import { removeQuoteFromPendingList } from "../../common/utils/quote"

import { PartyA, PartyBPartyA } from "../../generated/schema"
import { OpenPosition } from "../../generated/symmio/symmio"

export class OpenPositionHandler extends CommonOpenPositionHandler {

	constructor(event: OpenPosition) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		let event = super.getEvent()
		removeQuoteFromPendingList(event.params.quoteId)

	}
}
