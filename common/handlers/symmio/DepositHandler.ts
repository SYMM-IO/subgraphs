import { BaseHandler, Version } from "../../BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum";
import { Account, DebugEntity } from "../../../generated/schema";
import { createNewAccount } from "../../utils/analytics&user_profile";

export class DepositHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()
		let account = Account.load(event.params.user.toHexString())
		if (!account) {
			account = createNewAccount(event.params.account, event.params.account, null, event.block, event.transaction, event.params.name)
		}
		account.deposit = account.deposit.plus(event.params.amount)
		account.globalCounter = globalCounter
		account.save()
	}
}