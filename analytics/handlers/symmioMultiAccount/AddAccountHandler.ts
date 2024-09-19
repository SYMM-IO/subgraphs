import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {
	AddAccountHandler as CommonAddAccountHandler
} from "../../../common/handlers/symmioMultiAccount/AddAccountHandler"
import {User} from "../../../generated/schema"
import {MultiAccountVersion} from "../../../common/BaseHandler";
import {getDailyHistoryForTimestamp, getTotalHistory} from "../../utils/builders";

export class AddAccountHandler<T> extends CommonAddAccountHandler<T> {
	handle(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let user = User.load(event.params.user.toHexString())
		super.handleAccount(_event, version)

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, event.address)
		const th = getTotalHistory(event.block.timestamp, event.address)
		if (user == null) {
			dh.newUsers = dh.newUsers.plus(BigInt.fromString("1"))
			th.users = th.users.plus(BigInt.fromString("1"))
		}
		dh.newAccounts = dh.newAccounts.plus(BigInt.fromString("1"))
		th.accounts = th.accounts.plus(BigInt.fromString("1"))
		dh.save()
		th.save()
	}
}
