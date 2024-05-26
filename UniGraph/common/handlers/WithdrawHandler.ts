import { BaseHandler } from "./BaseHandler"
import { Withdraw } from "../../generated/symmio/symmio"

export class WithdrawHandler extends BaseHandler {
	protected event: Withdraw

	constructor(event: Withdraw) {
		super(event)
		this.event = event
	}

	protected getEvent(): Withdraw {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}


}