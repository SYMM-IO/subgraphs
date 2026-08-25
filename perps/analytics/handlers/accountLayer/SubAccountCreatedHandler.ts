import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { SubAccountCreatedHandler as CommonSubAccountCreatedHandler } from "../../../common/handlers/accountLayer/SubAccountCreatedHandler"
import { Account as AccountModel, User } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { normalizeCoreSource } from "../../../common/utils/account_layer_resolver"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory } from "../../utils/builders"
import { syncAffiliateExpressWithdrawAccountMembership } from "../../utils/affiliateExpressWithdrawComponents"

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

		// dailyHistory/totalHistory rows are keyed by the core resolved and stored by the common handler.
		let source: Bytes | null = normalizeCoreSource(account.coreSource)
		if (source === null) return

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
		syncAffiliateExpressWithdrawAccountMembership(account, event.block.timestamp, event.block.number)
	}
}
