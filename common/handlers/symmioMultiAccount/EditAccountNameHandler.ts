import {BaseMultiAccountHandler, MultiAccountVersion} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts";
import {Account} from "../../../generated/schema";

export class EditAccountNameHandler<T> extends BaseMultiAccountHandler {
	handleAccount(_event: ethereum.Event, version: MultiAccountVersion): void {
		super.handleAccount(_event, version);
		// @ts-ignore
		const event = changetype<T>(_event)
		let account = Account.load(event.params.account.toHexString())!
		account.name = event.params.newName;
		account.save();
	}
}