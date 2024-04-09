import {BaseHandler} from "./BaseHandler"
import {RequestToCancelCloseRequest} from "../../generated/symmio/symmio"

export class RequestToCancelCloseRequestHandler extends BaseHandler {
	private event: RequestToCancelCloseRequest

	constructor(event: RequestToCancelCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}