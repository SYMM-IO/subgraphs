import { BaseHandler } from "./BaseHandler"
import { Withdraw } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"
import { createNewAccount, createNewUser } from "../utils"

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

	handleAccount(): void {
		super.handleAccount()
		let event = this.getEvent()
		let account = Account.load(event.params.user.toHexString())
		if (account == null) {
			let user = createNewUser(event.params.user, null, event.block, event.transaction)
			account = createNewAccount(event.params.user, user, null, event.block, event.transaction)
		}
	}
}