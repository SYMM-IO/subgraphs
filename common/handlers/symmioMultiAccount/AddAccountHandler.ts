import {ethereum} from "@graphprotocol/graph-ts"
import {BaseMultiAccountHandler, MultiAccountVersion} from "../../BaseHandler"
import {AccountType, createNewAccountIfNotExists} from "../../utils/builders"

export class AddAccountHandler<T> extends BaseMultiAccountHandler {
	handleAccount(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		createNewAccountIfNotExists(event.params.account, event.params.user, event.address, AccountType.NORMAL, event.block, event.transaction, event.params.name)
	}
}