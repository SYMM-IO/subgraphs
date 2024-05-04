import { BaseHandler } from "./BaseHandler"
import { DeallocatePartyA } from "../../generated/symmio/symmio"

export class DeallocatePartyAHandler extends BaseHandler {
	protected event: DeallocatePartyA

	constructor(event: DeallocatePartyA) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}