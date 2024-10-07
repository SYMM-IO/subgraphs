import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {AccountType, createNewAccountIfNotExists} from "../../utils/builders";

export class RegisterPartyBHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		super.handleAccount(_event, version);
		// @ts-ignore
		const event = changetype<T>(_event)
		createNewAccountIfNotExists(event.params.partyB, event.params.partyB, null, AccountType.SOLVER, event.block, event.transaction)
	}
}