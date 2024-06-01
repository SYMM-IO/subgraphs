import { BaseHandler } from "./BaseHandler"
import { AllocatePartyB } from "../../generated/symmio/symmio"

export class AllocatePartyBHandler extends BaseHandler {
	protected event: AllocatePartyB

	constructor(event: AllocatePartyB) {
		super(event)
		this.event = event
	}

	protected getEvent(): AllocatePartyB {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}