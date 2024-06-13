import { DeallocatePartyAHandler as CommonDeallocatePartyAHandler } from "../../common/handlers/DeallocatePartyAHandler"
import { Account, BalanceChange } from "../../generated/schema"
import { DeallocatePartyA } from "../../generated/symmio/symmio"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory } from "../utils"

export class DeallocatePartyAHandler extends CommonDeallocatePartyAHandler {

	constructor(event: DeallocatePartyA) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		let event = super.getEvent()
		let account = Account.load(event.params.user.toHexString())
		if (account == null) return
		account.deallocated = account.deallocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()

		let deallocate = new BalanceChange(
			event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
		)
		deallocate.type = "DEALLOCATE_PARTY_A"
		deallocate.timestamp = event.block.timestamp
		deallocate.blockNumber = event.block.number
		deallocate.transaction = event.transaction.hash
		deallocate.amount = event.params.amount
		deallocate.account = account.id
		deallocate.collateral = getConfiguration(event).collateral
		deallocate.save()

		const dh = getDailyHistoryForTimestamp(
			event.block.timestamp,
			event.params.user,
			account.accountSource,
		)
		dh.deallocate = dh.deallocate.plus(event.params.amount)
		dh.accDeallocate = dh.accDeallocate.plus(event.params.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(
			event.block.timestamp,
			event.params.user,
			account.accountSource,
		)
		th.deallocate = th.deallocate.plus(event.params.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
