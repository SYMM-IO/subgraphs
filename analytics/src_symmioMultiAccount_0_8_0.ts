import {AddAccountHandler} from './handlers/symmioMultiAccount/AddAccountHandler'
import {
	AddAccount,
	EditAccountName,
	RoleGranted,
	RoleRevoked
} from '../generated/symmioMultiAccount_0_8_0/symmioMultiAccount_0_8_0'
import {RoleGrantedHandler} from './handlers/symmioMultiAccount/RoleGrantedHandler'
import {RoleRevokedHandler} from './handlers/symmioMultiAccount/RoleRevokedHandler'
import {Version} from '../common/BaseHandler'
import {EditAccountNameHandler} from "./handlers/symmioMultiAccount/EditAccountNameHandler";


export function handleAddAccount(event: AddAccount): void {
	let handler = new AddAccountHandler<AddAccount>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, Version.v_0_8_0)
}

export function handleEditAccountName(event: EditAccountName): void {
	let handler = new EditAccountNameHandler<EditAccountName>()
	handler.handle(event, Version.v_0_8_0)
}
