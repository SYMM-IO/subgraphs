import { SendQuoteHandler as CommonSendQuoteHandler } from "../../common/handlers/SendQuoteHandler"
import { getGlobalCounterAndInc } from "../../common/helper"
import { PartyA } from "../../generated/schema"
import { SendQuote } from "../../generated/symmio/symmio"

export class SendQuoteHandler extends CommonSendQuoteHandler {

	constructor(event: SendQuote) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()

		let partyA = PartyA.load(this.event.params.partyA.toHexString())
		if (!partyA) {
			partyA = new PartyA(this.event.params.partyA.toHexString())
			partyA.quoteUntilLiquid = [this.event.params.quoteId]
		} else {
			let temp = partyA.quoteUntilLiquid!.slice(0)
			temp.push(this.event.params.quoteId)
			partyA.quoteUntilLiquid = temp.slice(0)
		}
		partyA.globalCounter = getGlobalCounterAndInc()
		partyA.save()
	}
}
