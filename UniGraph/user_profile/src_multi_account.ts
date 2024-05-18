
import {AddAccountHandler} from "./handlers/AddAccountHandlerMultiAccount"
import {AddAccount} from "../generated/symmioMultiAccount_0/symmioMultiAccount"
		
export function handleAddAccount(event: AddAccount): void {
	let handler = new AddAccountHandler(event)
	handler.handle()
}
		