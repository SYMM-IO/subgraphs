import {BaseHandler} from "./BaseHandler"
import {LockQuote} from "../../generated/symmio/symmio"

export class LockQuoteHandler extends BaseHandler {
	private event: LockQuote

	constructor(event: LockQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}