import { BaseHandler } from "./BaseHandler"
import { ChargeFundingRate } from "../../generated/symmio/symmio"

export class ChargeFundingRateHandler extends BaseHandler {
	protected event: ChargeFundingRate

	constructor(event: ChargeFundingRate) {
		super(event)
		this.event = event
	}

	protected getEvent(): ChargeFundingRate {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}