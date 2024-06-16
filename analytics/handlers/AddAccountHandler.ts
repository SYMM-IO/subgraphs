import { AddAccountHandler as CommonAddAccountHandler } from "../../common/handlers/AddAccountHandlerMultiAccount"
import { AddAccount } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"
import { newUserAndAccount } from "../utils"

export class AddAccountHandler extends CommonAddAccountHandler {

	constructor(event: AddAccount) {
		super(event)
	}

	handle(): void {
		super.handle()
		let event = super.getEvent()
		newUserAndAccount(event.params.user, event.block, event.transaction)
	}
}
