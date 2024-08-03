import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {BaseHandler, Version} from "../../BaseHandler"
import {getDailyHistoryForTimestamp, getTotalHistory} from "../../../analytics/utils/builders"
import {User} from "../../../generated/schema"
import {createNewAccount, createNewUser} from "../../utils/analytics&user_profile"

export class AddAccountHandler<T> extends BaseHandler {
	handleAccount(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const dh = getDailyHistoryForTimestamp(event.block.timestamp, event.address)
		const th = getTotalHistory(event.block.timestamp, event.address)
		let user = User.load(event.params.user.toHexString())
		if (user == null) {
			user = createNewUser(event.params.user, event.block, event.transaction)
			dh.newUsers = dh.newUsers.plus(BigInt.fromString("1"))
			th.users = th.users.plus(BigInt.fromString("1"))
		}
		createNewAccount(event.params.account, user, event.address, event.block, event.transaction, event.params.name)
		dh.newAccounts = dh.newAccounts.plus(BigInt.fromString("1"))
		th.accounts = th.accounts.plus(BigInt.fromString("1"))
		dh.save()
		th.save()
	}
}