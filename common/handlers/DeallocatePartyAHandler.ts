import { BaseHandler } from "../BaseHandler"
import { DeallocatePartyA } from "../../generated/symmio/symmio"

export class DeallocatePartyAHandler extends BaseHandler {
	protected event: DeallocatePartyA

	constructor(event: DeallocatePartyA) {
		super(event)
		this.event = event
	}

	protected getEvent(): DeallocatePartyA {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}