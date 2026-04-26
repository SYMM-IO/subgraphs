import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { SubAccountCreatedHandler as CommonSubAccountCreatedHandler } from "../../../common/handlers/accountLayer/SubAccountCreatedHandler"
import { Account as AccountModel, User } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { accountLayer_1 } from "../../../../generated/accountLayer_1/accountLayer_1"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory } from "../../utils/builders"

export class SubAccountCreatedHandler<T> extends CommonSubAccountCreatedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		// Capture pre-existence BEFORE super, since createNewAccountIfNotExists creates the User as a side effect
		let user = User.load(event.params.owner.toHexString())
		// @ts-ignore
		super.handleAccount(_event, version)
		const account = AccountModel.load(event.params.account.toHexString())
		if (account == null) return

		// Resolve symmio core address — dailyHistory/totalHistory rows are keyed by symmio core, not accountLayer
		let contract = accountLayer_1.bind(event.address)
		let coreResult = contract.try_getRelatedCore(event.params.account)
		let source: Bytes = coreResult.reverted ? event.address : coreResult.value

		const accountSource = event.params.affiliate
		const dh = getDailyHistoryForTimestamp(event.block.timestamp, accountSource, source)
		const th = getTotalHistory(event.block.timestamp, accountSource, getConfiguration(event).collateral, source)
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
