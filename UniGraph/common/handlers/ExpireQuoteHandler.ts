import { BaseHandler } from "./BaseHandler"
import { ExpireQuote } from "../../generated/symmio/symmio"
import { Quote } from "../../generated/schema"

export class ExpireQuoteHandler extends BaseHandler {
	private event: ExpireQuote

	constructor(event: ExpireQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		let entity = Quote.load(this.event.params.quoteId.toString())!
		entity.GlobalCounter = getGlobalCounterAndInc()
		if (entity.quoteStatus === 2) {
			log.debug(`Quote id: ${entity.quoteId} , expire tr hash: ${event.transaction.hash}`, [])
		}
		entity.quoteId = event.params.quoteId
		entity.timeStamp = event.block.timestamp
		entity.quoteStatus = event.params.quoteStatus

		entity.save()
	}
}