import { DepositHandler as CommonDepositHandler } from "../../common/handlers/DepositHandler"
import { Deposit } from "../../generated/symmio/symmio"
import { Account, BalanceChange } from "../../generated/schema"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory, updateActivityTimestamps } from "./utils"

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

		let account = Account.load(event.params.user.toHexString())!
		account.deposit = account.deposit.plus(event.params.amount)
		account.save()
		updateActivityTimestamps(account, event.block.timestamp)
		let deposit = new BalanceChange(
			event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
		)
		deposit.type = "DEPOSIT"
		deposit.timestamp = event.block.timestamp
		deposit.blockNumber = event.block.number
		deposit.transaction = event.transaction.hash
		deposit.amount = event.params.amount
		deposit.account = event.params.user
		deposit.collateral = getConfiguration(event).collateral
		deposit.save()

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
		dh.deposit = dh.deposit.plus(deposit.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(event.block.timestamp, account.accountSource)
		th.deposit = th.deposit.plus(deposit.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
