import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { LegacyAccountImportedHandler as CommonLegacyAccountImportedHandler } from "../../../common/handlers/accountLayer/LegacyAccountImportedHandler"
import { Account as AccountModel, User } from "../../../../generated/schema"
import { AccountLayerVersion } from "../../../common/BaseHandler"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory } from "../../utils/builders"

export class LegacyAccountImportedHandler<T> extends CommonLegacyAccountImportedHandler<T> {
	handle(_event: ethereum.Event, version: AccountLayerVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handleAccount(_event, version)

		let user = User.load(event.params.owner.toHexString())
		const account = AccountModel.load(event.params.account.toHexString())!

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, event.params.affiliate, account.source!)
		const th = getTotalHistory(event.block.timestamp, event.params.affiliate, getConfiguration(event).collateral, account.source!)
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
