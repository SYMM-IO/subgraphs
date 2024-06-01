import { BaseHandler } from "./BaseHandler"
import { LiquidatePositionsPartyA } from "../../generated/symmio/symmio"

export class LiquidatePositionsPartyAHandler extends BaseHandler {
	protected event: LiquidatePositionsPartyA

	constructor(event: LiquidatePositionsPartyA) {
		super(event)
		this.event = event
	}

	protected getEvent(): LiquidatePositionsPartyA {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		// TODO
	}
}