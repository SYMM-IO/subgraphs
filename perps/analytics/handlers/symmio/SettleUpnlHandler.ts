import {SettleUpnlHandler as CommonSettleUpnlHandler} from "../../../common/handlers/symmio/SettleUpnlHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SettleUpnlHandler<T> extends CommonSettleUpnlHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
