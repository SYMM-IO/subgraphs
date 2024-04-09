import {BaseHandler} from "./BaseHandler"
import {ChargeFundingRate} from "../../generated/symmio/symmio"

export class ChargeFundingRateHandler extends BaseHandler {
	private event: ChargeFundingRate

	constructor(event: ChargeFundingRate) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}