import {
	ForceCancelCloseRequestHandler as CommonForceCancelCloseRequestHandler
} from "../../../common/handlers/symmio/ForceCancelCloseRequestHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class ForceCancelCloseRequestHandler<T> extends CommonForceCancelCloseRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
