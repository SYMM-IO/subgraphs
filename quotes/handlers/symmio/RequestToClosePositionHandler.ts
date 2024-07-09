import {
	RequestToClosePositionHandler as CommonRequestToClosePositionHandler
} from "../../../common/handlers/symmio/RequestToClosePositionHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RequestToClosePositionHandler<T> extends CommonRequestToClosePositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
