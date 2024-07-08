import {
	AcceptCancelCloseRequestHandler as CommonAcceptCancelCloseRequestHandler
} from "../../common/handlers/AcceptCancelCloseRequestHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class AcceptCancelCloseRequestHandler<T> extends CommonAcceptCancelCloseRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
