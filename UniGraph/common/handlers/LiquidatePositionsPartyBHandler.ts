import {BaseHandler} from "./BaseHandler"
import {LiquidatePositionsPartyB} from "../../generated/symmio/symmio"

export class LiquidatePositionsPartyBHandler extends BaseHandler {
	private event: LiquidatePositionsPartyB

	constructor(event: LiquidatePositionsPartyB) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}