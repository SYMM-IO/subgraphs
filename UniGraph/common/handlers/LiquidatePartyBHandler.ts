import {BaseHandler} from "./BaseHandler"
import {LiquidatePartyB} from "../../generated/symmio/symmio"

export class LiquidatePartyBHandler extends BaseHandler {
	private event: LiquidatePartyB

	constructor(event: LiquidatePartyB) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}