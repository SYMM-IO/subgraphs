import {
	EmergencyClosePositionHandler as CommonEmergencyClosePositionHandler
} from "../../common/handlers/EmergencyClosePositionHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class EmergencyClosePositionHandler<T> extends CommonEmergencyClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
