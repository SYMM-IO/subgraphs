import { WithdrawHandler as CommonWithdrawHandler } from "../../../common/handlers/symmio/WithdrawHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getConfiguration } from "../../utils/builders"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { AccountType, createNewAccountIfNotExists } from "../../../common/utils/builders"
import { updateActivityTimestamps } from "../../utils/activityHelpers"
import { resolveAccountSourceFromAccountLayer } from "../../../common/utils/account_layer_resolver"
import { updatePartyALatestBalance } from "../../utils/latestAccountBalance"
import { isFinalizeWithdrawRequestCall, recordWithdrawFinalizationHint } from "../../utils/withdrawRequest"
import { newBalanceChange, setBalanceChangeContext } from "../../utils/balanceChange"

export class WithdrawHandler<T> extends CommonWithdrawHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)

		let accountSource = resolveAccountSourceFromAccountLayer(event.params.user)
		let account = createNewAccountIfNotExists(
			event.params.user,
			event.params.user,
			accountSource,
			AccountType.UNKNOWN,
			event.block,
			event.transaction,
		)
		account.globalCounter = globalCounter
		account.source = event.address
		account.withdraw = account.withdraw.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
		updateActivityTimestamps(account, event.block.timestamp, event.address)
		let withdraw = newBalanceChange(event)
		withdraw.source = event.address
		withdraw.type = "WITHDRAW"
		withdraw.timestamp = event.block.timestamp
		withdraw.blockNumber = event.block.number
		withdraw.transaction = event.transaction.hash
		withdraw.amount = event.params.amount
		withdraw.account = event.params.user
		withdraw.collateral = getConfiguration(event).collateral
		createNewAccountIfNotExists(event.params.sender, event.params.sender, null, AccountType.UNKNOWN, event.block, event.transaction)
		withdraw.sender = event.params.sender
		withdraw.senderRef = event.params.sender.toHexString()
		setBalanceChangeContext(withdraw, account, event.address, _event.transaction.input)
		withdraw.save()
		if (isFinalizeWithdrawRequestCall(_event.transaction.input)) {
			recordWithdrawFinalizationHint(
				_event.address,
				_event.transaction.hash,
				event.params.sender,
				event.params.user,
				event.params.amount,
				_event.logIndex,
				_event.block.timestamp,
			)
		}
		updatePartyALatestBalance(_event, version, event.params.user)
		updateHistories(new UpdateHistoriesParams(version, account, null, event).withdraw(event.params.amount))
	}
}
