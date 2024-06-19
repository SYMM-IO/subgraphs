import { DeallocateForPartyBHandler as CommonDeallocateForPartyBHandler } from "../../common/handlers/DeallocateForPartyBHandler"
import { DeallocateForPartyB } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"

export class DeallocateForPartyBHandler extends CommonDeallocateForPartyBHandler {

	constructor(event: DeallocateForPartyB) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		const event = this.getEvent()
		let account = Account.load(event.params.partyB.toHexString())!
		account.deallocated = account.deallocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}
