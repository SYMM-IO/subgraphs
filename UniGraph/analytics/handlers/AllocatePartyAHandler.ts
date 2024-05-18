import { AllocatePartyAHandler as CommonAllocatePartyAHandler } from "../../common/handlers/AllocatePartyAHandler"
import { AllocatePartyA } from "../../generated/symmio/symmio"
import { Account, BalanceChange } from "../../generated/schema"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory, updateActivityTimestamps } from "./utils"

export class AllocatePartyAHandler extends CommonAllocatePartyAHandler {

	constructor(event: AllocatePartyA) {
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

		let account = Account.load(event.params.user.toHexString())!
		account.allocated = account.allocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
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
