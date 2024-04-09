import {BaseHandler} from "./BaseHandler"
import {OpenPosition} from "../../generated/symmio/symmio"

export class OpenPositionHandler extends BaseHandler {
	private event: OpenPosition

	constructor(event: OpenPosition) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}