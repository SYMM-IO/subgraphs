import {
	DeallocatePartyAHandler as CommonDeallocatePartyAHandler
} from "../../../common/handlers/symmio/DeallocatePartyAWithAccountHandler"
import {Account, BalanceChange} from "../../../generated/schema"
import {getConfiguration, getDailyHistoryForTimestamp, getTotalHistory, updateActivityTimestamps} from "../../utils"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DeallocatePartyAHandler<T> extends CommonDeallocatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.user.toHexString())
		if (account == null)
			return
		updateActivityTimestamps(account, event.block.timestamp)
		let deallocate = new BalanceChange(
			event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
		)
		deallocate.type = "DEALLOCATE_PARTY_A"
		deallocate.timestamp = event.block.timestamp
		deallocate.blockNumber = event.block.number
		deallocate.transaction = event.transaction.hash
		deallocate.amount = event.params.amount
		deallocate.account = event.params.user
		deallocate.collateral = getConfiguration(event).collateral
		deallocate.save()

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
		dh.deallocate = dh.deallocate.plus(deallocate.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(event.block.timestamp, account.accountSource)
		th.deallocate = th.deallocate.plus(deallocate.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
