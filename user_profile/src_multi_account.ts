
import { AddAccountHandler } from "./handlers/AddAccountHandlerMultiAccount"
import { AddAccount, EditAccountName as EditAccountNameEvent, } from "../generated/symmioMultiAccount_0/symmioMultiAccount"
import { Account } from "../generated/schema"

export function handleAddAccount(event: AddAccount): void {
	let handler = new AddAccountHandler(event)
	handler.handle()
}


export function handleEditAccountName(event: EditAccountNameEvent): void {
	let account = Account.load(event.params.account.toHexString())!
	account.name = event.params.newName
	account.updateTimestamp = event.block.timestamp
	account.save()
}