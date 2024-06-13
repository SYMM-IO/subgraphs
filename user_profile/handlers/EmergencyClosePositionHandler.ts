import { EmergencyClosePositionHandler as CommonEmergencyClosePositionHandler } from "../../common/handlers/EmergencyClosePositionHandler"
import { EmergencyClosePosition } from "../../generated/symmio/symmio"
import { handleClose } from "./handleClose"

export class EmergencyClosePositionHandler extends CommonEmergencyClosePositionHandler {

	constructor(event: EmergencyClosePosition) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()
		handleClose(event, 'EmergencyClosePosition')
	}
}
