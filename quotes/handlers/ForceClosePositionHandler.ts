import {
	ForceClosePositionHandler as CommonForceClosePositionHandler
} from "../../common/handlers/ForceClosePositionHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class ForceClosePositionHandler<T> extends CommonForceClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
