import {BaseHandler} from "./BaseHandler"
import {EmergencyClosePosition} from "../../generated/symmio/symmio"

export class EmergencyClosePositionHandler extends BaseHandler {
	private event: EmergencyClosePosition

	constructor(event: EmergencyClosePosition) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}