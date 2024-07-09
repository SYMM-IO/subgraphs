import {WithdrawHandler as CommonWithdrawHandler} from "../../../common/handlers/symmio/WithdrawHandler"
import {Account, BalanceChange} from "../../../generated/schema"
import {
	getConfiguration,
	getDailyHistoryForTimestamp,
	getTotalHistory,
	newUserAndAccount,
	updateActivityTimestamps
} from "../../utils"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class WithdrawHandler<T> extends CommonWithdrawHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)

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
