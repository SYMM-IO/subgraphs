import { DepositWithAccountHandler as CommonDepositHandler } from "../../../common/handlers/symmio/DepositWithAccountHandler"
import { Account, BalanceChange } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getConfiguration } from "../../utils/builders"
import { AccountType, createNewAccountIfNotExists } from "../../../common/utils/builders"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateActivityTimestamps } from "../../utils/activityHelpers"

export class DepositHandler<T> extends CommonDepositHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.user.toHexString())
		if (!account) return
		updateActivityTimestamps(account, event.block.timestamp, event.address)
		let deposit = new BalanceChange(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		deposit.source = event.address
		deposit.type = "DEPOSIT"
		deposit.timestamp = event.block.timestamp
		deposit.blockNumber = event.block.number
		deposit.transaction = event.transaction.hash
		deposit.amount = event.params.amount
		if (
			deposit.transaction.toHexString() == "0xd87280448339c9bec39f98ea17e7371f13562b8b446863db7ee8f4ce53261c71" &&
			deposit.blockNumber == BigInt.fromI32(35228647) &&
			deposit.source.toHexString() == "0xc6a7cc26fd84ae573b705423b7d1831139793025"
		)
			deposit.amount = event.params.amount.div(BigInt.fromString("1000000000000"))
		deposit.account = event.params.user
		deposit.collateral = getConfiguration(event).collateral
		// Upsert sender Account stub so senderRef resolves. If sender is a VA,
		// VirtualAccountCreatedHandler / EmergencyMarginRecoveredHandler flip
		// isVirtual=true (same tx or retroactively). Frontend filter `isVirtual_not: true`
		// excludes VA senders — see docs/frontend-balance-change-filter.md.
		createNewAccountIfNotExists(event.params.sender, event.params.sender, null, AccountType.UNKNOWN, event.block, event.transaction)
		deposit.sender = event.params.sender
		deposit.senderRef = event.params.sender.toHexString()
		deposit.save()
		updateHistories(new UpdateHistoriesParams(version, account, null, event).deposit(deposit.amount))
	}
}
