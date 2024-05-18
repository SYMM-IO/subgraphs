import { SetCollateralHandler as CommonSetCollateralHandler } from "../../common/handlers/SetCollateralHandler"
import { SetCollateral } from "../../generated/symmio/symmio"
import { getConfiguration } from "./utils"

export class SetCollateralHandler extends CommonSetCollateralHandler {
	protected event: SetCollateral

	constructor(event: SetCollateral) {
		super(event)
		this.event = event
	}

	protected getEvent(): SetCollateral {
		return this.event
	}

	handle(): void {
		const event = this.getEvent()
		let configuration = getConfiguration(event)
		configuration.collateral = event.params.collateral
		configuration.save()
	}

	handleQuote(): void {
	}
}