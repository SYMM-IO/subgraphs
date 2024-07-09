import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {AddAccountHandler as CommonAddAccountHandler} from "../../../common/handlers/symmioMultiAccount/AddAccountHandler"
import {createNewAccount, createNewUser} from "../../../common/utils/analytics&user_profile"
import {User} from "../../../generated/schema"
import {getDailyHistoryForTimestamp, getTotalHistory} from "../../utils"
import {Version} from "../../../common/BaseHandler";

export class AddAccountHandler<T> extends CommonAddAccountHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		let user = User.load(event.params.user.toHexString())
		if (user == null) {
			user = createNewUser(event.params.user, event.block, event.transaction)
		} else {
			const dh = getDailyHistoryForTimestamp(event.block.timestamp, event.address)
			dh.newUsers = dh.newUsers.plus(BigInt.fromString("1"))
			dh.save()
			const th = getTotalHistory(event.block.timestamp, event.address)
			th.users = th.users.plus(BigInt.fromString("1"))
			th.save()
		}
		createNewAccount(event.params.account, user, event.address, event.block, event.transaction, event.params.name)
	}
}
