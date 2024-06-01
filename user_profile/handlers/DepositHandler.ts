import { DepositHandler as CommonDepositHandler } from "../../common/handlers/DepositHandler"
import { Account } from "../../generated/schema"
import { Deposit } from "../../generated/symmio/symmio"
import { createNewUser, createNewAccount } from '../../common/utils/analytics&user_profile'
import { getDailyHistoryForTimestamp, getTotalHistory } from "../utils"

export class DepositHandler extends CommonDepositHandler {

	constructor(event: Deposit) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		let event = super.getEvent()
		let account = Account.load(event.params.user.toHexString())
		if (!account) {
			let user = createNewUser(
				event.params.user,
				event.block,
				event.transaction,
			)
			account = createNewAccount(
				event.params.user,
				user,
				null,
				event.block,
				event.transaction,
			)
		}

		const dh = getDailyHistoryForTimestamp(
			event.block.timestamp,
			event.params.user,
			account.accountSource,
		)
		dh.deposit = dh.deposit.plus(event.params.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(
			event.block.timestamp,
			event.params.user,
			account.accountSource,
		)
		th.deposit = th.deposit.plus(event.params.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
