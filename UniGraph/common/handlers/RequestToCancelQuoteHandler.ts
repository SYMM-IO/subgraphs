import {BaseHandler} from "./BaseHandler"
import {RequestToCancelQuote} from "../../generated/symmio/symmio"

export class RequestToCancelQuoteHandler extends BaseHandler {
	private event: RequestToCancelQuote

	constructor(event: RequestToCancelQuote) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}