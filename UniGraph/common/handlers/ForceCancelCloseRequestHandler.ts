import {BaseHandler} from "./BaseHandler"
import {ForceCancelCloseRequest} from "../../generated/symmio/symmio"

export class ForceCancelCloseRequestHandler extends BaseHandler {
	private event: ForceCancelCloseRequest

	constructor(event: ForceCancelCloseRequest) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}