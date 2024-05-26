import { BaseHandler } from "./BaseHandler"
import { Deposit } from "../../generated/symmio/symmio"

export class DepositHandler extends BaseHandler {
	protected event: Deposit

	constructor(event: Deposit) {
		super(event)
		this.event = event
	}

	protected getEvent(): Deposit {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}

}