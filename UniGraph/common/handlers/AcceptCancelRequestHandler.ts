import {BaseHandler} from "./BaseHandler"
import {AcceptCancelRequest} from "../../generated/symmio/symmio"

export class AcceptCancelRequestHandler extends BaseHandler {
	private event: AcceptCancelRequest

	constructor(event: AcceptCancelRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}