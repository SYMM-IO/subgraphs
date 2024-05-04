import { AddAccountHandler } from "./handlers/AddAccountHandlerMultiAccount"
import { AddAccount, RoleGranted, RoleRevoked } from "../generated/symmioMultiAccount_0/symmioMultiAccount"

import { RoleGrantedHandler } from "./handlers/RoleGrantedHandlerMultiAccount"

import { RoleRevokedHandler } from "./handlers/RoleRevokedHandlerMultiAccount"

export function handleAddAccount(event: AddAccount): void {
	let handler = new AddAccountHandler(event)
	handler.handle()
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler(event)
	handler.handle()
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler(event)
	handler.handle()
}
		