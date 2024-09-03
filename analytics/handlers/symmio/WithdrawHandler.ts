import {WithdrawHandler as CommonWithdrawHandler} from "../../../common/handlers/symmio/WithdrawHandler"
import {Account, BalanceChange} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {getConfiguration, newUserAndAccount} from "../../utils/builders";

import {updateActivityTimestamps, updateHistories, UpdateHistoriesParams} from "../../utils/helpers";
import {USER_PROFILE} from "../../config";

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
		if (!USER_PROFILE) {
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
		}
		updateHistories(
			new UpdateHistoriesParams(account, event.block.timestamp)
				.withdraw(event.params.amount)
		)
	}
}
