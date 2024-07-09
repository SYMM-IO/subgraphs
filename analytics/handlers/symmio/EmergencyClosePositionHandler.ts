import {
	EmergencyClosePositionHandler as CommonEmergencyClosePositionHandler
} from "../../../common/handlers/symmio/EmergencyClosePositionHandler"
import {handleClose} from "../../utils"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {EmergencyClosePosition as EmergencyClosePosition_0_8_2} from "../../../generated/symmio_0_8_2/symmio_0_8_2";
import {EmergencyClosePosition as EmergencyClosePosition_0_8_0} from "../../../generated/symmio_0_8_0/symmio_0_8_0";

export class EmergencyClosePositionHandler<T> extends CommonEmergencyClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		switch (version) {
			case Version.v_0_8_2: {
				handleClose<EmergencyClosePosition_0_8_2>(event, "EmergencyClosePosition")
				break
			}
			case Version.v_0_8_0: {
				handleClose<EmergencyClosePosition_0_8_0>(event, "EmergencyClosePosition")
				break
			}
		}
	}
}
