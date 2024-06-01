
import { AllocatePartyBHandler as CommonAllocatePartyBHandler } from "../../common/handlers/AllocatePartyBHandler"
import { Account } from "../../generated/schema"
import { AllocatePartyB } from "../../generated/symmio/symmio"

export class AllocatePartyBHandler extends CommonAllocatePartyBHandler {

	constructor(event: AllocatePartyB) {
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
		account.allocated = account.allocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}
