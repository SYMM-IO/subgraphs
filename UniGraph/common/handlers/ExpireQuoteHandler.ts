import {BaseHandler} from "./BaseHandler"
import {ExpireQuote} from "../../generated/symmio/symmio"

export class ExpireQuoteHandler extends BaseHandler {
	private event: ExpireQuote

	constructor(event: ExpireQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}