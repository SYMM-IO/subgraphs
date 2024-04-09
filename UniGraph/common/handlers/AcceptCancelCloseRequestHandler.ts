import {BaseHandler} from "./BaseHandler"
import {AcceptCancelCloseRequest} from "../../generated/symmio/symmio"

export class AcceptCancelCloseRequestHandler extends BaseHandler {
	private event: AcceptCancelCloseRequest

	constructor(event: AcceptCancelCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}