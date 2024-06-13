import { WithdrawHandler as CommonWithdrawHandler } from "../../common/handlers/WithdrawHandler"
import { createNewAccount, createNewUser } from "../../common/utils/analytics&user_profile"
import { Account } from "../../generated/schema"
import { Withdraw } from "../../generated/symmio/symmio"
import { getDailyHistoryForTimestamp, getTotalHistory } from "../utils"

export class WithdrawHandler extends CommonWithdrawHandler {

	constructor(event: Withdraw) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		let event = super.getEvent()
		let account = Account.load(event.params.sender.toHexString())
		if (!account) {
			let user = createNewUser(
				event.params.sender,
				event.block,
				event.transaction,
			)
			account = createNewAccount(
				event.params.sender,
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
		dh.withdraw = dh.withdraw.plus(event.params.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(
			event.block.timestamp,
			event.params.user,
			account.accountSource,
		)
		th.withdraw = th.withdraw.plus(event.params.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()

	}
}
