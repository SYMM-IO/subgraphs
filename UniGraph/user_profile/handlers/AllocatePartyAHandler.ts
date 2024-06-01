import { AllocatePartyAHandler as CommonAllocatePartyAHandler } from "../../common/handlers/AllocatePartyAHandler"
import { Account, BalanceChange } from "../../generated/schema"
import { AllocatePartyA, } from "../../generated/symmio/symmio"
import { getConfiguration, getDailyHistoryForTimestamp, getTotalHistory } from "../utils"

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

		let allocate = new BalanceChange(
			event.transaction.hash.toHex() + "-" + event.logIndex.toHexString(),
		)
		allocate.type = "ALLOCATE_PARTY_A"
		allocate.timestamp = event.block.timestamp
		allocate.blockNumber = event.block.number
		allocate.transaction = event.transaction.hash
		allocate.amount = event.params.amount
		allocate.account = account.id
		allocate.collateral = getConfiguration(event).collateral
		allocate.save()

		const dh = getDailyHistoryForTimestamp(
			event.block.timestamp,
			event.params.user,
			account.accountSource,
		)
		dh.allocate = dh.allocate.plus(event.params.amount)
		dh.accAllocate = dh.accAllocate.plus(event.params.amount)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(
			event.block.timestamp,
			event.params.user,
			account.accountSource,
		)
		th.allocate = th.allocate.plus(event.params.amount)
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
