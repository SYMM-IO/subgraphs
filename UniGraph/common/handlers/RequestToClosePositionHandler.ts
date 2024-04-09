import {BaseHandler} from "./BaseHandler"
import {RequestToClosePosition} from "../../generated/symmio/symmio"

export class RequestToClosePositionHandler extends BaseHandler {
	private event: RequestToClosePosition

	constructor(event: RequestToClosePosition) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}