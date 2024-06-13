
import { AllocateForPartyBHandler as CommonAllocateForPartyBHandler } from "../../common/handlers/AllocateForPartyBHandler"
import { Account } from "../../generated/schema"
import { AllocateForPartyB } from "../../generated/symmio/symmio"

export class AllocateForPartyBHandler extends CommonAllocateForPartyBHandler {

	constructor(event: AllocateForPartyB) {
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
		let account = Account.load(event.params.partyB.toHexString())!
		account.allocated = account.allocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}
