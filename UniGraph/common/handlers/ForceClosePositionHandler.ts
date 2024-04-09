import {BaseHandler} from "./BaseHandler"
import {ForceClosePosition} from "../../generated/symmio/symmio"

export class ForceClosePositionHandler extends BaseHandler {
	private event: ForceClosePosition

	constructor(event: ForceClosePosition) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}