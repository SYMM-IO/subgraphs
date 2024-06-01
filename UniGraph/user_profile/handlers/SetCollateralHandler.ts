
import { SetCollateralHandler as CommonSetCollateralHandler } from "../../common/handlers/SetCollateralHandler"
import { SetCollateral } from "../../generated/symmio/symmio"
import { getConfiguration } from "../utils"

export class SetCollateralHandler extends CommonSetCollateralHandler {

	constructor(event: SetCollateral) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()

		let configuration = getConfiguration(event)
		configuration.collateral = event.params.collateral
		configuration.save()
	}
}
