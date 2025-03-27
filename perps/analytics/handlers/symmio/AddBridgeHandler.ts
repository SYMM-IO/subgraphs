import {AddBridgeHandler as CommonAddBridgeHandler} from "../../../common/handlers/symmio/AddBridgeHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AddBridgeHandler<T> extends CommonAddBridgeHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
