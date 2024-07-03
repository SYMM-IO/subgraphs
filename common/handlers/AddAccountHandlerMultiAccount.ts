import { BaseHandler } from "../BaseHandler"
import { AddAccount } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"

export class AddAccountHandler extends BaseHandler {
	protected event: AddAccount

	constructor(event: AddAccount) {
		super(event)
		this.event = event
	}
	
	protected getEvent(): AddAccount {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
		// TODO
	}
}