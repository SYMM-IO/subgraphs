
import {RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler} from "../../common/handlers/RequestToCancelQuoteHandler"
import {RequestToCancelQuote} from "../../generated/symmio/symmio"

export class RequestToCancelQuoteHandler extends CommonRequestToCancelQuoteHandler {

    constructor(event: RequestToCancelQuote) {
        super(event)
    }

    handle(): void {
		super.handle()
    }
}
