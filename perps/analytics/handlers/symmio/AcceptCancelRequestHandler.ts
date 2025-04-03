import {
	AcceptCancelRequestHandler as CommonAcceptCancelRequestHandler
} from "../../../common/handlers/symmio/AcceptCancelRequestHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AcceptCancelRequestHandler<T> extends CommonAcceptCancelRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
