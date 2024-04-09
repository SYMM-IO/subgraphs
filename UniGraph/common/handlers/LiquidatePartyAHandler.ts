import {BaseHandler} from "./BaseHandler"
import {LiquidatePartyA} from "../../generated/symmio/symmio"

export class LiquidatePartyAHandler extends BaseHandler {
	private event: LiquidatePartyA

	constructor(event: LiquidatePartyA) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}