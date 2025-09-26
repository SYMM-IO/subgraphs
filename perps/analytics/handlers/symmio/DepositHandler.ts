import { DepositWithAccountHandler as CommonDepositHandler } from "../../../common/handlers/symmio/DepositWithAccountHandler"
import { Account, BalanceChange } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getConfiguration } from "../../utils/builders"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { BalanceChangeType, balanceChangeTypes } from "../../utils/constants"
import { updateActivityTimestamps } from "../../utils/activityHelpers"

export class DepositHandler<T> extends CommonDepositHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.user.toHexString())!
		updateActivityTimestamps(account, event.block.timestamp, event.address)
		let deposit = new BalanceChange(event.transaction.hash.toHex() + "-" + event.logIndex.toHexString())
		deposit.source = event.address
		deposit.type = balanceChangeTypes.get(BalanceChangeType.DEPOSIT)
		deposit.timestamp = event.block.timestamp
		deposit.blockNumber = event.block.number
		deposit.transaction = event.transaction.hash
		deposit.amount = event.params.amount
		if (
			deposit.transaction.toHexString() == "0xd87280448339c9bec39f98ea17e7371f13562b8b446863db7ee8f4ce53261c71" &&
			deposit.blockNumber == BigInt.fromI32(35228647) &&
			deposit.source.toHexString() == "0xC6a7cc26fd84aE573b705423b7d1831139793025".toLowerCase()
		)
			deposit.amount = event.params.amount.div(BigInt.fromI32(1000000))
		deposit.account = event.params.user
		deposit.collateral = getConfiguration(event).collateral
		deposit.save()
		updateHistories(new UpdateHistoriesParams(version, account, null, event).deposit(event.params.amount))
	}
}
