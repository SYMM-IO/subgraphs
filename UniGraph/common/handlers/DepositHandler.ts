import { BaseHandler } from "./BaseHandler"
import { Deposit } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"
import { createNewAccount, createNewUser } from "../utils"

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