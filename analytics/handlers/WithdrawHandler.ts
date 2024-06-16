import { WithdrawHandler as CommonWithdrawHandler } from "../../common/handlers/WithdrawHandler"
import { Withdraw } from "../../generated/symmio/symmio"
import { Account, BalanceChange } from "../../generated/schema"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory, newUserAndAccount, updateActivityTimestamps } from "../utils"

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

		let event = super.getEvent()
		newUserAndAccount(event.params.sender, event.block, event.transaction)

		let account = Account.load(event.params.sender.toHexString())!
		account.globalCounter = globalCounter
		account.withdraw = account.withdraw.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
		updateActivityTimestamps(account, event.block.timestamp)
		let withdraw = new BalanceChange(
			event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
		)
		withdraw.type = "WITHDRAW"
		withdraw.timestamp = event.block.timestamp
		withdraw.blockNumber = event.block.number
		withdraw.transaction = event.transaction.hash
		withdraw.amount = event.params.amount
		withdraw.account = event.params.sender
		withdraw.collateral = getConfiguration(event).collateral
		withdraw.save()

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
		dh.withdraw = dh.withdraw.plus(withdraw.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(event.block.timestamp, account.accountSource)
		th.withdraw = th.withdraw.plus(withdraw.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
