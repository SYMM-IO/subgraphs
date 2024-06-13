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
		let partyAEntity = PartyA.load(event.params.partyA.toHexString())
		if (!partyAEntity) {
			partyAEntity = new PartyA(event.params.partyA.toHexString())
			partyAEntity.quoteUntilLiquid = [event.params.quoteId]
		} else {
			let temp = partyAEntity.quoteUntilLiquid!.slice(0)
			temp.push(event.params.quoteId)

			partyAEntity.quoteUntilLiquid = temp.slice(0)
		}
		partyAEntity.globalCounter = super.handleGlobalCounter()
		partyAEntity.save()
	}
}
