import { RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler } from "../../common/handlers/RequestToCancelQuoteHandler"
import { getGlobalCounterAndInc } from "../../common/utils"

import { PartyA, Quote } from "../../generated/schema"
import { RequestToCancelQuote } from "../../generated/symmio/symmio"

export class RequestToCancelQuoteHandler extends CommonRequestToCancelQuoteHandler {

	constructor(event: RequestToCancelQuote) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		let quote = Quote.load(this.event.params.quoteId.toString())!
		if (this.event.params.quoteStatus === 3) {
			let partyAEntity = PartyA.load(quote.partyA.toHexString())!
			partyAEntity.globalCounter = getGlobalCounterAndInc()
			let temp = partyAEntity.quoteUntilLiquid!.slice(0)
			const indexA = temp.indexOf(this.event.params.quoteId)
			temp.splice(indexA, 1)
			partyAEntity.quoteUntilLiquid = temp.slice(0)
			partyAEntity.save()
		}
	}
}
