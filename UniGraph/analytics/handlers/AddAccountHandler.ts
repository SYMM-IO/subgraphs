import { AddAccountHandlerMultiAccount as CommonAddAccountHandler } from "../../common/handlers/AddAccountHandlerMultiAccount"
import { AddAccount } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"

export class AddAccountHandler extends CommonAddAccountHandler {

	constructor(event: AddAccount) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
	}
}
