import { DeallocatePartyAHandler as CommonDeallocatePartyAHandler } from "../../common/handlers/DeallocatePartyAHandler"
import { DeallocatePartyA } from "../../generated/symmio/symmio"
import { Account, BalanceChange } from "../../generated/schema"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory, updateActivityTimestamps } from "../utils"

export class DeallocatePartyAHandler extends CommonDeallocatePartyAHandler {

	constructor(event: DeallocatePartyA) {
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

		let account = Account.load(event.params.user.toHexString())
		if (account == null)
			return
		account.deallocated = account.deallocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
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
