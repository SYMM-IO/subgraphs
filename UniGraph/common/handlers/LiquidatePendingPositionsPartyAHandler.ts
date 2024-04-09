import {BaseHandler} from "./BaseHandler"
import {LiquidatePendingPositionsPartyA} from "../../generated/symmio/symmio"

export class LiquidatePendingPositionsPartyAHandler extends BaseHandler {
	private event: LiquidatePendingPositionsPartyA

	constructor(event: LiquidatePendingPositionsPartyA) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}