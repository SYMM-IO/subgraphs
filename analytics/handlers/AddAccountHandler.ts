import { BigInt } from "@graphprotocol/graph-ts"
import { AddAccountHandler as CommonAddAccountHandler } from "../../common/handlers/AddAccountHandlerMultiAccount"
import { createNewAccount, createNewUser } from "../../common/utils/analytics&user_profile"
import { AddAccount } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"
import { getDailyHistoryForTimestamp, getTotalHistory, newUserAndAccount } from "../utils"
import { User } from "../../generated/schema"

export class AddAccountHandler extends CommonAddAccountHandler {

	constructor(event: AddAccount) {
		super(event)
	}

	handle(): void {
		super.handle()
		let event = super.getEvent()
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
