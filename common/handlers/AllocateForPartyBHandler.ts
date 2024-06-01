import { BaseHandler } from "./BaseHandler"
import { AllocateForPartyB } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"

export class AllocateForPartyBHandler extends BaseHandler {
	protected event: AllocateForPartyB

	constructor(event: AllocateForPartyB) {
		super(event)
		this.event = event
	}

	protected getEvent(): AllocateForPartyB {
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
		account.allocated = account.allocated.plus(event.params.amount)
		account.updateTimestamp = event.block.timestamp
		account.save()
	}
}