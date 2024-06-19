import { BaseHandler } from "./BaseHandler"
import { DeallocateForPartyB } from "../../generated/symmio/symmio"

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

	}
}