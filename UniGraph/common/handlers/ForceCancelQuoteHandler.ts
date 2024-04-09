import {BaseHandler} from "./BaseHandler"
import {ForceCancelQuote} from "../../generated/symmio/symmio"

export class ForceCancelQuoteHandler extends BaseHandler {
	private event: ForceCancelQuote

	constructor(event: ForceCancelQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}