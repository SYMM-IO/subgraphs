import { EmergencyClosePositionHandler as CommonEmergencyClosePositionHandler } from "../../../common/handlers/symmio/EmergencyClosePositionHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { handleClose } from "../commonHandlers/close"

export class EmergencyClosePositionHandler<T> extends CommonEmergencyClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		handleClose<T>(_event, "EmergencyClosePosition", version, "EMERGENCY_CLOSE")
	}
}
