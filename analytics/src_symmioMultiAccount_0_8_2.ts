import {AddAccountHandler} from './handlers/symmioMultiAccount/AddAccountHandler'
import {AddAccount} from '../generated/symmioMultiAccount_0_8_2/symmioMultiAccount_0_8_2'
import {EditAccountNameHandler} from './handlers/symmioMultiAccount/EditAccountNameHandler'
import {EditAccountName} from '../generated/symmioMultiAccount_0_8_2/symmioMultiAccount_0_8_2'
import {RoleGrantedHandler} from './handlers/symmioMultiAccount/RoleGrantedHandler'
import {RoleGranted} from '../generated/symmioMultiAccount_0_8_2/symmioMultiAccount_0_8_2'
import {RoleRevokedHandler} from './handlers/symmioMultiAccount/RoleRevokedHandler'
import {RoleRevoked} from '../generated/symmioMultiAccount_0_8_2/symmioMultiAccount_0_8_2'
import {Version} from '../common/BaseHandler'


export function handleEditAccountName(event: EditAccountName): void {
    let handler = new EditAccountNameHandler<EditAccountName>()
    handler.handle(event, Version.v_0_8_2)
}


export function handleAddAccount(event: AddAccount): void {
    let handler = new AddAccountHandler<AddAccount>()
    handler.handle(event, Version.v_0_8_2)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, Version.v_0_8_2)
}


export function handleRoleGranted(event: RoleGranted): void {
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, Version.v_0_8_2)
}
