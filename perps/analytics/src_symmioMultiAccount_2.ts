import {AddAccountHandler} from './handlers/symmioMultiAccount/AddAccountHandler'
import {AddAccount} from '../../generated/symmioMultiAccount_2/symmioMultiAccount_2'
import {EditAccountNameHandler} from './handlers/symmioMultiAccount/EditAccountNameHandler'
import {EditAccountName} from '../../generated/symmioMultiAccount_2/symmioMultiAccount_2'
import {MultiAccountVersion} from '../common/BaseHandler'
import {RoleGrantedHandler} from './handlers/symmioMultiAccount/RoleGrantedHandler'
import {RoleGranted} from '../../generated/symmioMultiAccount_2/symmioMultiAccount_2'
import {RoleRevokedHandler} from './handlers/symmioMultiAccount/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/symmioMultiAccount_2/symmioMultiAccount_2'
import {ensureSyncMeta} from './src_sync_meta'


export function handleAddAccount(event: AddAccount): void {
	ensureSyncMeta(event.block)
    let handler = new AddAccountHandler<AddAccount>()
    handler.handle(event, MultiAccountVersion.v_2)
}


export function handleEditAccountName(event: EditAccountName): void {
	ensureSyncMeta(event.block)
    let handler = new EditAccountNameHandler<EditAccountName>()
    handler.handle(event, MultiAccountVersion.v_2)
}


export function handleRoleGranted(event: RoleGranted): void {
	ensureSyncMeta(event.block)
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, MultiAccountVersion.v_2)
}


export function handleRoleRevoked(event: RoleRevoked): void {
	ensureSyncMeta(event.block)
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, MultiAccountVersion.v_2)
}
