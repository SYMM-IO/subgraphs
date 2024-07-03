import { BaseHandler } from "../BaseHandler"
import { AllocatePartyA } from "../../generated/symmio/symmio"

export class AllocatePartyAHandler extends BaseHandler {
	protected event: AllocatePartyA

	constructor(event: AllocatePartyA) {
		super(event)
		this.event = event
	}

	protected getEvent(): AllocatePartyA {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}