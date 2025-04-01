import {
	RegisterPartyBHandler as CommonRegisterPartyBHandler
} from "../../../common/handlers/symmio/RegisterPartyBHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RegisterPartyBHandler<T> extends CommonRegisterPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
	}
}
