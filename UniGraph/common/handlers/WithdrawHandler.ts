import { BaseHandler } from "./BaseHandler"
import { Withdraw } from "../../generated/symmio/symmio"

export class WithdrawHandler extends BaseHandler {
	protected event: Withdraw

	constructor(event: Withdraw) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}