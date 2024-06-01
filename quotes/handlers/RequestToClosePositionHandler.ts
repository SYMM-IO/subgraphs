import { RequestToClosePositionHandler as CommonRequestToClosePositionHandler } from "../../common/handlers/RequestToClosePositionHandler"
import { RequestToClosePosition } from "../../generated/symmio/symmio"

export class RequestToClosePositionHandler extends CommonRequestToClosePositionHandler {

	constructor(event: RequestToClosePosition) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleQuote()
	}
}
