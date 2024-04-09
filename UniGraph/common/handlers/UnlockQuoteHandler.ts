import {BaseHandler} from "./BaseHandler"
import {UnlockQuote} from "../../generated/symmio/symmio"

export class UnlockQuoteHandler extends BaseHandler {
	private event: UnlockQuote

	constructor(event: UnlockQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}