import {ethereum} from "@graphprotocol/graph-ts"
import {BaseMultiAccountHandler, MultiAccountVersion} from "../../BaseHandler"
import {User} from "../../../generated/schema"
import {createNewAccount, createNewUser} from "../../utils/analytics&user_profile"

export class AddAccountHandler<T> extends BaseMultiAccountHandler {
	handleAccount(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let user = User.load(event.params.user.toHexString())
		if (user == null)
			user = createNewUser(event.params.user, event.block, event.transaction)
		createNewAccount(event.params.account, user, event.address, event.block, event.transaction, event.params.name)
	}
}