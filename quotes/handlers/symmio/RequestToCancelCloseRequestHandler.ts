import {
	RequestToCancelCloseRequestHandler as CommonRequestToCancelCloseRequestHandler,
} from "../../../common/handlers/symmio/RequestToCancelCloseRequestHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RequestToCancelCloseRequestHandler<T> extends CommonRequestToCancelCloseRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
