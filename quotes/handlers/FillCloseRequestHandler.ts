import {FillCloseRequestHandler as CommonFillCloseRequestHandler} from "../../common/handlers/FillCloseRequestHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../common/BaseHandler";

export class FillCloseRequestHandler<T> extends CommonFillCloseRequestHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
	}
}
