import { BaseHandler } from "./BaseHandler"
import { SetCollateral } from "../../generated/symmio/symmio"

export class SetCollateralHandler extends BaseHandler {
	protected event: SetCollateral

	constructor(event: SetCollateral) {
		super(event)
		this.event = event
	}

	protected getEvent(): SetCollateral {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}