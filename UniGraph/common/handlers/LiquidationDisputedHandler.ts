import { BaseHandler } from "./BaseHandler"
import { LiquidationDisputed } from "../../generated/symmio/symmio"

export class LiquidationDisputedHandler extends BaseHandler {
	protected event: LiquidationDisputed

	constructor(event: LiquidationDisputed) {
		super(event)
		this.event = event
	}

	protected getEvent(): LiquidationDisputed {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}