import {
	AddAccount as AddAccountEvent,
	EditAccountName as EditAccountNameEvent,
} from "../generated/symmioMultiAccount/symmioMultiAccount"
import {Account, User} from "../generated/schema"
import {createNewAccount, createNewUser, getDailyHistoryForTimestamp, getTotalHistory} from "./utils"
import {BigInt} from "@graphprotocol/graph-ts"

export function handleAddAccount(event: AddAccountEvent): void {
	let user = User.load(event.params.user.toHexString())
	if (user == null) {
		user = createNewUser(event.params.user, event.address, event.block, event.transaction)
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

export function handleEditAccountName(event: EditAccountNameEvent): void {
	let account = Account.load(event.params.account.toHexString())!
	account.name = event.params.newName
	account.updateTimestamp = event.block.timestamp
	account.save()
}
