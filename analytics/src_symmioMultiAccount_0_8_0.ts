import { AddAccountHandler } from './handlers/symmioMultiAccount/AddAccountHandler'
import { AddAccount } from '../generated/symmioMultiAccount_0_8_0_alpha_v1/symmioMultiAccount_0_8_0'
import { RoleGrantedHandler } from './handlers/symmioMultiAccount/RoleGrantedHandler'
import { RoleGranted } from '../generated/symmioMultiAccount_0_8_0_alpha_v1/symmioMultiAccount_0_8_0'
import { RoleRevokedHandler } from './handlers/symmioMultiAccount/RoleRevokedHandler'
import { RoleRevoked } from '../generated/symmioMultiAccount_0_8_0_alpha_v1/symmioMultiAccount_0_8_0'
import { Version } from '../common/BaseHandler'


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
