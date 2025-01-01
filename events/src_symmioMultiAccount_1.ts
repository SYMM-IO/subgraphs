import { RoleGrantedHandler } from "./handlers/symmioMultiAccount/RoleGrantedHandler"
import { AddAccount, RoleGranted, RoleRevoked } from "../generated/symmioMultiAccount_1/symmioMultiAccount_1"
import { RoleRevokedHandler } from "./handlers/symmioMultiAccount/RoleRevokedHandler"
import { MultiAccountVersion } from "../common/BaseHandler"
import { AddAccountHandler } from "./handlers/symmioMultiAccount/AddAccountHandler"

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
