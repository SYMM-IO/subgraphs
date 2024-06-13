import { AddAccountHandler as CommonAddAccountHandler } from "../../common/handlers/AddAccountHandlerMultiAccount"
import { AddAccount } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"
import { User } from "../../generated/schema"
import { createNewAccount, createNewUser } from "../../common/utils/analytics&user_profile"

export class AddAccountHandler extends CommonAddAccountHandler {

	constructor(event: AddAccount) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		let event = super.getEvent()
		let user = User.load(event.params.user.toHexString())
		if (user == null) {
			user = createNewUser(event.params.user, event.block, event.transaction)
		}
		createNewAccount(event.params.account, user, null, event.block, event.transaction, event.params.name)


	}
}
