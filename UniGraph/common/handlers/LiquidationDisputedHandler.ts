import { BaseHandler } from "./BaseHandler"
import { LiquidationDisputed } from "../../generated/symmio/symmio"

export class LiquidationDisputedHandler extends BaseHandler {
	protected event: LiquidationDisputed

	constructor(event: LiquidationDisputed) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}