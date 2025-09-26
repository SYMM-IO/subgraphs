import {
	SetFeeCollectorHandler as CommonSetFeeCollectorHandler
} from "../../../common/handlers/symmio/SetFeeCollectorHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetFeeCollectorHandler<T> extends CommonSetFeeCollectorHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
