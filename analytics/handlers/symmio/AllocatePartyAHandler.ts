import {
	AllocatePartyAHandler as CommonAllocatePartyAHandler
} from "../../../common/handlers/symmio/AllocatePartyAHandler"
import {Account, BalanceChange} from "../../../generated/schema"
import {getConfiguration, getDailyHistoryForTimestamp, getTotalHistory, updateActivityTimestamps} from "../../utils"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AllocatePartyAHandler<T> extends CommonAllocatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)
		let account = Account.load(event.params.user.toHexString())!
		updateActivityTimestamps(account, event.block.timestamp)
		let allocate = new BalanceChange(
			event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
		)
		allocate.type = "ALLOCATE_PARTY_A"
		allocate.timestamp = event.block.timestamp
		allocate.blockNumber = event.block.number
		allocate.transaction = event.transaction.hash
		allocate.amount = event.params.amount
		allocate.account = event.params.user
		allocate.collateral = getConfiguration(event).collateral
		allocate.save()

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
		dh.allocate = dh.allocate.plus(allocate.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(event.block.timestamp, account.accountSource)
		th.allocate = th.allocate.plus(allocate.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
