
import { DeallocateForPartyBHandler as CommonDeallocateForPartyBHandler } from "../../common/handlers/DeallocateForPartyBHandler"
import { Account } from "../../generated/schema"
import { DeallocateForPartyB } from "../../generated/symmio/symmio"

export class DeallocateForPartyBHandler extends CommonDeallocateForPartyBHandler {

	constructor(event: DeallocateForPartyB) {
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
		let account = Account.load(event.params.partyB.toHexString())!
		account.deallocated = account.deallocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()

	}
}
