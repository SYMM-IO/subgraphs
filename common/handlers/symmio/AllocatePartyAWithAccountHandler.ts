import {BaseHandler, Version} from "../../BaseHandler"
import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {Account} from "../../../generated/schema";
import {createNewAccount, createNewUser} from "../../utils/analytics&user_profile";

export class AllocatePartyAHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()
		let account = Account.load(event.params.user.toHexString())
		if (!account) {
			const user = createNewUser(event.params.user, event.block, event.transaction)
			account = createNewAccount(event.params.user, user, null, event.block, event.transaction)
		}
		account.allocated = account.allocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.globalCounter = globalCounter
		account.save()
	}
}