import { RoleGrantedHandler } from "./handlers/optionsMultiAccount/RoleGrantedHandler"
import { AddAccount, RoleGranted, RoleRevoked } from "../../generated/optionsMultiAccount_1/optionsMultiAccount_1"
import { RoleRevokedHandler } from "./handlers/optionsMultiAccount/RoleRevokedHandler"
import { MultiAccountVersion } from "../common/BaseHandler"
import { AddAccountHandler } from "./handlers/optionsMultiAccount/AddAccountHandler"

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, MultiAccountVersion.v_1)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, MultiAccountVersion.v_1)
}

export function handleAddAccount(event: AddAccount): void {
	let handler = new AddAccountHandler<AddAccount>()
	handler.handle(event, MultiAccountVersion.v_1)
}
