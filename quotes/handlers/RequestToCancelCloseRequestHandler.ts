import {
	RequestToCancelCloseRequestHandler as CommonRequestToCancelCloseRequestHandler,
} from "../../common/handlers/RequestToCancelCloseRequestHandler"
import { removeQuoteFromPendingList } from "../../common/utils/quote"
import { RequestToCancelCloseRequest } from "../../generated/symmio/symmio"

export class RequestToCancelCloseRequestHandler extends CommonRequestToCancelCloseRequestHandler {

	constructor(event: RequestToCancelCloseRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
		let event = super.getEvent()
		if (event.params.quoteStatus === 3) {
			removeQuoteFromPendingList(event.params.quoteId)
		}
	}
}
