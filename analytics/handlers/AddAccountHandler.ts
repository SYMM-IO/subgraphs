import { BigInt } from "@graphprotocol/graph-ts"
import { AddAccountHandler as CommonAddAccountHandler } from "../../common/handlers/AddAccountHandlerMultiAccount"
import { createNewAccount, createNewUser } from "../../common/utils/analytics&user_profile"
import { AddAccount } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"
import { getDailyHistoryForTimestamp, getTotalHistory, newUserAndAccount } from "../utils"
import { User } from "../../generated/schema"

export class AddAccountHandler extends CommonAddAccountHandler {

	constructor(event: AddAccount) {
		super(event)
	}

	handle(): void {
		super.handle()

	}
}
