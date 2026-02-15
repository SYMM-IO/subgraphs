import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, BalanceChange } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getConfiguration } from "../../utils/builders"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { AccountType, createNewAccountIfNotExists } from "../../../common/utils/builders"
import { updateActivityTimestamps } from "../../utils/activityHelpers"

export class WithdrawInitiatedHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const globalCounter = super.handleGlobalCounter()

		// Sum amounts from all withdraw parts
		let totalAmount = BigInt.zero()
		for (let i = 0; i < event.params.parts.length; i++) {
			totalAmount = totalAmount.plus(event.params.parts[i].amount)
		}

		let account = createNewAccountIfNotExists(event.params.user, event.params.user, null, AccountType.UNKNOWN, event.block, event.transaction)
		account.globalCounter = globalCounter
		account.source = event.address
		account.withdraw = account.withdraw.plus(totalAmount)
		account.updateTimestamp = event.block.timestamp
		account.save()
		updateActivityTimestamps(account, event.block.timestamp, event.address)

		let withdraw = new BalanceChange(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		withdraw.source = event.address
		withdraw.type = "WITHDRAW"
		withdraw.timestamp = event.block.timestamp
		withdraw.blockNumber = event.block.number
		withdraw.transaction = event.transaction.hash
		withdraw.amount = totalAmount
		withdraw.account = event.params.user
		withdraw.collateral = getConfiguration(event).collateral
		withdraw.save()

		updateHistories(new UpdateHistoriesParams(version, account, null, event).withdraw(totalAmount))
	}
}
