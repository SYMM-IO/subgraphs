import { BaseHandler } from "./BaseHandler"
import { LiquidatePartyB } from "../../generated/symmio/symmio"

export class LiquidatePartyBHandler extends BaseHandler {
	protected event: LiquidatePartyB

	constructor(event: LiquidatePartyB) {
		super(event)
		this.event = event
	}

	handle(): void { }
	handleQuote(): void {
		// TODO
	}
}