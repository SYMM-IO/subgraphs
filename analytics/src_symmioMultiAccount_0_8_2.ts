import { AddAccountHandler } from "./handlers/symmioMultiAccount/AddAccountHandler"
import { AddAccount } from "../generated/symmioMultiAccount_0_8_2_MultiAccount1/symmioMultiAccount_0_8_2"


import { Version } from "../common/BaseHandler"

export function handleAddAccount(event: AddAccount): void {
	let handler = new AddAccountHandler<AddAccount>()
	handler.handle(event, Version.v_0_8_2)
}
