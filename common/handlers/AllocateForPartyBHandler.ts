import { BaseHandler } from "../BaseHandler"
import { AllocateForPartyB } from "../../generated/symmio/symmio"

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

	}
}