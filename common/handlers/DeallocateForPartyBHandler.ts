import { BaseHandler } from "./BaseHandler"
import { DeallocateForPartyB } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"

export class DeallocateForPartyBHandler extends BaseHandler {
	protected event: DeallocateForPartyB

	constructor(event: DeallocateForPartyB) {
		super(event)
		this.event = event
	}

	protected getEvent(): DeallocateForPartyB {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}

	handleAccount(): void {
		super.handleAccount()
		const event = this.getEvent()
		let account = Account.load(event.params.partyB.toHexString())!
		account.deallocated = account.deallocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}