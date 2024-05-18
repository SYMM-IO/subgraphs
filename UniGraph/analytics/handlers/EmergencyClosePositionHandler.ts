import { EmergencyClosePositionHandler as CommonEmergencyClosePositionHandler } from "../../common/handlers/EmergencyClosePositionHandler"
import { EmergencyClosePosition } from "../../generated/symmio/symmio"
import { handleClose } from "./utils"

export class EmergencyClosePositionHandler extends CommonEmergencyClosePositionHandler {

	constructor(event: EmergencyClosePosition) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		handleClose(this.getEvent(), "EmergencyClosePosition")
	}
}
