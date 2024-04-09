import {BaseHandler} from "./BaseHandler"
import {LiquidatePositionsPartyA} from "../../generated/symmio/symmio"

export class LiquidatePositionsPartyAHandler extends BaseHandler {
	private event: LiquidatePositionsPartyA

	constructor(event: LiquidatePositionsPartyA) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}