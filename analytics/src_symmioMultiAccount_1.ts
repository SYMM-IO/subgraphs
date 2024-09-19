import {AddAccountHandler} from './handlers/symmioMultiAccount/AddAccountHandler'
import {
	AddAccount,
	EditAccountName,
	RoleGranted,
	RoleRevoked
} from '../generated/symmioMultiAccount_1/symmioMultiAccount_1'
import {EditAccountNameHandler} from './handlers/symmioMultiAccount/EditAccountNameHandler'
import {RoleGrantedHandler} from './handlers/symmioMultiAccount/RoleGrantedHandler'
import {RoleRevokedHandler} from './handlers/symmioMultiAccount/RoleRevokedHandler'
import {MultiAccountVersion} from '../common/BaseHandler'


export function handleAddAccount(event: AddAccount): void {
	let handler = new AddAccountHandler<AddAccount>()
	handler.handle(event, MultiAccountVersion.v_1)
}


export function handleEditAccountName(event: EditAccountName): void {
	let handler = new EditAccountNameHandler<EditAccountName>()
	handler.handle(event, MultiAccountVersion.v_1)
}


export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, MultiAccountVersion.v_1)
}


export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, MultiAccountVersion.v_1)
}
