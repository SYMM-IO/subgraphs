import {AccountLayerVersion} from '../common/BaseHandler'
import {AccountManagerDeployedHandler} from './handlers/accountLayer/AccountManagerDeployedHandler'
import {AccountManagerDeployed} from '../../generated/accountLayer_3/accountLayer_3'
import {AddMarginHandler} from './handlers/accountLayer/AddMarginHandler'
import {AddMargin} from '../../generated/accountLayer_3/accountLayer_3'
import {AdminTransferCancelledHandler} from './handlers/accountLayer/AdminTransferCancelledHandler'
import {AdminTransferCancelled} from '../../generated/accountLayer_3/accountLayer_3'
import {AdminTransferCompletedHandler} from './handlers/accountLayer/AdminTransferCompletedHandler'
import {AdminTransferCompleted} from '../../generated/accountLayer_3/accountLayer_3'
import {AdminTransferProposedHandler} from './handlers/accountLayer/AdminTransferProposedHandler'
import {AdminTransferProposed} from '../../generated/accountLayer_3/accountLayer_3'
import {AffiliateApprovedHandler} from './handlers/accountLayer/AffiliateApprovedHandler'
import {AffiliateApproved} from '../../generated/accountLayer_3/accountLayer_3'
import {AffiliatePausedHandler} from './handlers/accountLayer/AffiliatePausedHandler'
import {AffiliatePaused} from '../../generated/accountLayer_3/accountLayer_3'
import {AffiliateRegisteredHandler} from './handlers/accountLayer/AffiliateRegisteredHandler'
import {AffiliateRegistered} from '../../generated/accountLayer_3/accountLayer_3'
import {AffiliateUnpausedHandler} from './handlers/accountLayer/AffiliateUnpausedHandler'
import {AffiliateUnpaused} from '../../generated/accountLayer_3/accountLayer_3'
import {AffiliateUpdatedHandler} from './handlers/accountLayer/AffiliateUpdatedHandler'
import {AffiliateUpdated} from '../../generated/accountLayer_3/accountLayer_3'
import {EditAccountNameHandler} from './handlers/accountLayer/EditAccountNameHandler'
import {EditAccountName} from '../../generated/accountLayer_3/accountLayer_3'
import {EmergencyMarginRecoveredHandler} from './handlers/accountLayer/EmergencyMarginRecoveredHandler'
import {EmergencyMarginRecovered} from '../../generated/accountLayer_3/accountLayer_3'
import {FeeUpdateCancelledHandler} from './handlers/accountLayer/FeeUpdateCancelledHandler'
import {FeeUpdateCancelled} from '../../generated/accountLayer_3/accountLayer_3'
import {FeesClaimedHandler} from './handlers/accountLayer/FeesClaimedHandler'
import {FeesClaimed} from '../../generated/accountLayer_3/accountLayer_3'
import {LegacyAccountImportedHandler} from './handlers/accountLayer/LegacyAccountImportedHandler'
import {LegacyAccountImported} from '../../generated/accountLayer_3/accountLayer_3'
import {RegistrationCancelledHandler} from './handlers/accountLayer/RegistrationCancelledHandler'
import {RegistrationCancelled} from '../../generated/accountLayer_3/accountLayer_3'
import {RegistrationRejectedHandler} from './handlers/accountLayer/RegistrationRejectedHandler'
import {RegistrationRejected} from '../../generated/accountLayer_3/accountLayer_3'
import {RemoveMarginHandler} from './handlers/accountLayer/RemoveMarginHandler'
import {RemoveMargin} from '../../generated/accountLayer_3/accountLayer_3'
import {RoleGrantedHandler} from './handlers/accountLayer/RoleGrantedHandler'
import {RoleGranted} from '../../generated/accountLayer_3/accountLayer_3'
import {RoleRevokedHandler} from './handlers/accountLayer/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/accountLayer_3/accountLayer_3'
import {SingleVAModeChangedHandler} from './handlers/accountLayer/SingleVAModeChangedHandler'
import {SingleVAModeChanged} from '../../generated/accountLayer_3/accountLayer_3'
import {StakeholdersUpdateRequestedHandler} from './handlers/accountLayer/StakeholdersUpdateRequestedHandler'
import {StakeholdersUpdateRequested} from '../../generated/accountLayer_3/accountLayer_3'
import {StakeholdersUpdatedHandler} from './handlers/accountLayer/StakeholdersUpdatedHandler'
import {StakeholdersUpdated} from '../../generated/accountLayer_3/accountLayer_3'
import {SubAccountCreatedHandler} from './handlers/accountLayer/SubAccountCreatedHandler'
import {SubAccountCreated} from '../../generated/accountLayer_3/accountLayer_3'
import {SubAccountDeletedHandler} from './handlers/accountLayer/SubAccountDeletedHandler'
import {SubAccountDeleted} from '../../generated/accountLayer_3/accountLayer_3'
import {SubAccountOwnershipTransferredHandler} from './handlers/accountLayer/SubAccountOwnershipTransferredHandler'
import {SubAccountOwnershipTransferred} from '../../generated/accountLayer_3/accountLayer_3'
import {VirtualAccountCreatedHandler} from './handlers/accountLayer/VirtualAccountCreatedHandler'
import {VirtualAccountCreated} from '../../generated/accountLayer_3/accountLayer_3'
import {VirtualAccountDeletedHandler} from './handlers/accountLayer/VirtualAccountDeletedHandler'
import {VirtualAccountDeleted} from '../../generated/accountLayer_3/accountLayer_3'
import {VirtualAccountReusedHandler} from './handlers/accountLayer/VirtualAccountReusedHandler'
import {VirtualAccountReused} from '../../generated/accountLayer_3/accountLayer_3'
import {ensureSyncMeta} from './src_sync_meta'


export function handleAccountManagerDeployed(event: AccountManagerDeployed): void {
    ensureSyncMeta(event.block)
    let handler = new AccountManagerDeployedHandler<AccountManagerDeployed>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAddMargin(event: AddMargin): void {
    ensureSyncMeta(event.block)
    let handler = new AddMarginHandler<AddMargin>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAdminTransferCancelled(event: AdminTransferCancelled): void {
    ensureSyncMeta(event.block)
    let handler = new AdminTransferCancelledHandler<AdminTransferCancelled>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAdminTransferCompleted(event: AdminTransferCompleted): void {
    ensureSyncMeta(event.block)
    let handler = new AdminTransferCompletedHandler<AdminTransferCompleted>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAdminTransferProposed(event: AdminTransferProposed): void {
    ensureSyncMeta(event.block)
    let handler = new AdminTransferProposedHandler<AdminTransferProposed>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAffiliateApproved(event: AffiliateApproved): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliateApprovedHandler<AffiliateApproved>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAffiliatePaused(event: AffiliatePaused): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliatePausedHandler<AffiliatePaused>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAffiliateRegistered(event: AffiliateRegistered): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliateRegisteredHandler<AffiliateRegistered>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAffiliateUnpaused(event: AffiliateUnpaused): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliateUnpausedHandler<AffiliateUnpaused>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAffiliateUpdated(event: AffiliateUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliateUpdatedHandler<AffiliateUpdated>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleEditAccountName(event: EditAccountName): void {
    ensureSyncMeta(event.block)
    let handler = new EditAccountNameHandler<EditAccountName>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleEmergencyMarginRecovered(event: EmergencyMarginRecovered): void {
    ensureSyncMeta(event.block)
    let handler = new EmergencyMarginRecoveredHandler<EmergencyMarginRecovered>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleFeeUpdateCancelled(event: FeeUpdateCancelled): void {
    ensureSyncMeta(event.block)
    let handler = new FeeUpdateCancelledHandler<FeeUpdateCancelled>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleFeesClaimed(event: FeesClaimed): void {
    ensureSyncMeta(event.block)
    let handler = new FeesClaimedHandler<FeesClaimed>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleLegacyAccountImported(event: LegacyAccountImported): void {
    ensureSyncMeta(event.block)
    let handler = new LegacyAccountImportedHandler<LegacyAccountImported>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleRegistrationCancelled(event: RegistrationCancelled): void {
    ensureSyncMeta(event.block)
    let handler = new RegistrationCancelledHandler<RegistrationCancelled>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleRegistrationRejected(event: RegistrationRejected): void {
    ensureSyncMeta(event.block)
    let handler = new RegistrationRejectedHandler<RegistrationRejected>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleRemoveMargin(event: RemoveMargin): void {
    ensureSyncMeta(event.block)
    let handler = new RemoveMarginHandler<RemoveMargin>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleRoleGranted(event: RoleGranted): void {
    ensureSyncMeta(event.block)
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    ensureSyncMeta(event.block)
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleSingleVAModeChanged(event: SingleVAModeChanged): void {
    ensureSyncMeta(event.block)
    let handler = new SingleVAModeChangedHandler<SingleVAModeChanged>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleStakeholdersUpdateRequested(event: StakeholdersUpdateRequested): void {
    ensureSyncMeta(event.block)
    let handler = new StakeholdersUpdateRequestedHandler<StakeholdersUpdateRequested>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleStakeholdersUpdated(event: StakeholdersUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new StakeholdersUpdatedHandler<StakeholdersUpdated>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleSubAccountCreated(event: SubAccountCreated): void {
    ensureSyncMeta(event.block)
    let handler = new SubAccountCreatedHandler<SubAccountCreated>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleSubAccountDeleted(event: SubAccountDeleted): void {
    ensureSyncMeta(event.block)
    let handler = new SubAccountDeletedHandler<SubAccountDeleted>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleSubAccountOwnershipTransferred(event: SubAccountOwnershipTransferred): void {
    ensureSyncMeta(event.block)
    let handler = new SubAccountOwnershipTransferredHandler<SubAccountOwnershipTransferred>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleVirtualAccountCreated(event: VirtualAccountCreated): void {
    ensureSyncMeta(event.block)
    let handler = new VirtualAccountCreatedHandler<VirtualAccountCreated>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleVirtualAccountDeleted(event: VirtualAccountDeleted): void {
    ensureSyncMeta(event.block)
    let handler = new VirtualAccountDeletedHandler<VirtualAccountDeleted>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleVirtualAccountReused(event: VirtualAccountReused): void {
    ensureSyncMeta(event.block)
    let handler = new VirtualAccountReusedHandler<VirtualAccountReused>()
    handler.handle(event, AccountLayerVersion.v_3)
}
