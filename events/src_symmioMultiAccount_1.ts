import {RoleGrantedHandler} from './handlers/symmioMultiAccount/RoleGrantedHandler'
import {RoleGranted, RoleRevoked} from '../generated/symmioMultiAccount_1/symmioMultiAccount_1'
import {RoleRevokedHandler} from './handlers/symmioMultiAccount/RoleRevokedHandler'
import {MultiAccountVersion} from '../common/BaseHandler'


export function handleRoleGranted(event: RoleGranted): void {
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, MultiAccountVersion.v_1)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, MultiAccountVersion.v_1)
}
