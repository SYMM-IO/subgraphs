import {AccountLayerVersion} from '../common/BaseHandler'
import {AccountManagerDeployedHandler} from './handlers/accountLayer/AccountManagerDeployedHandler'
import {AccountManagerDeployed} from '../../generated/accountLayer_3/accountLayer_3'
import {AccountManagerImplementationUpdatedHandler} from './handlers/accountLayer/AccountManagerImplementationUpdatedHandler'
import {AccountManagerImplementationUpdated} from '../../generated/accountLayer_3/accountLayer_3'
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
import {CallAllowedSelectorsSetHandler} from './handlers/accountLayer/CallAllowedSelectorsSetHandler'
import {CallAllowedSelectorsSet} from '../../generated/accountLayer_3/accountLayer_3'
import {CallHandler} from './handlers/accountLayer/CallHandler'
import {Call} from '../../generated/accountLayer_3/accountLayer_3'
import {EditAccountNameHandler} from './handlers/accountLayer/EditAccountNameHandler'
import {EditAccountName} from '../../generated/accountLayer_3/accountLayer_3'
import {EmergencyMarginRecoveredHandler} from './handlers/accountLayer/EmergencyMarginRecoveredHandler'
import {EmergencyMarginRecovered} from '../../generated/accountLayer_3/accountLayer_3'
import {FeeUpdateCancelledHandler} from './handlers/accountLayer/FeeUpdateCancelledHandler'
import {FeeUpdateCancelled} from '../../generated/accountLayer_3/accountLayer_3'
import {FeesClaimedHandler} from './handlers/accountLayer/FeesClaimedHandler'
import {FeesClaimed} from '../../generated/accountLayer_3/accountLayer_3'
import {FeesDistributedHandler} from './handlers/accountLayer/FeesDistributedHandler'
import {FeesDistributed} from '../../generated/accountLayer_3/accountLayer_3'
import {HookActionExecutedHandler} from './handlers/accountLayer/HookActionExecutedHandler'
import {HookActionExecuted} from '../../generated/accountLayer_3/accountLayer_3'
import {HookAllowedSelectorsSetHandler} from './handlers/accountLayer/HookAllowedSelectorsSetHandler'
import {HookAllowedSelectorsSet} from '../../generated/accountLayer_3/accountLayer_3'
import {HookRemovedHandler} from './handlers/accountLayer/HookRemovedHandler'
import {HookRemoved} from '../../generated/accountLayer_3/accountLayer_3'
import {HookSetHandler} from './handlers/accountLayer/HookSetHandler'
import {HookSet} from '../../generated/accountLayer_3/accountLayer_3'
import {LegacyAccountImportedHandler} from './handlers/accountLayer/LegacyAccountImportedHandler'
import {LegacyAccountImported} from '../../generated/accountLayer_3/accountLayer_3'
import {OperatorSetHandler} from './handlers/accountLayer/OperatorSetHandler'
import {OperatorSet} from '../../generated/accountLayer_3/accountLayer_3'
import {OwnershipTransferCanceledHandler} from './handlers/accountLayer/OwnershipTransferCanceledHandler'
import {OwnershipTransferCanceled} from '../../generated/accountLayer_3/accountLayer_3'
import {OwnershipTransferStartedHandler} from './handlers/accountLayer/OwnershipTransferStartedHandler'
import {OwnershipTransferStarted} from '../../generated/accountLayer_3/accountLayer_3'
import {OwnershipTransferredHandler} from './handlers/accountLayer/OwnershipTransferredHandler'
import {OwnershipTransferred} from '../../generated/accountLayer_3/accountLayer_3'
import {PausedHandler} from './handlers/accountLayer/PausedHandler'
import {Paused} from '../../generated/accountLayer_3/accountLayer_3'
import {RegistrationCancelledHandler} from './handlers/accountLayer/RegistrationCancelledHandler'
import {RegistrationCancelled} from '../../generated/accountLayer_3/accountLayer_3'
import {RegistrationRejectedHandler} from './handlers/accountLayer/RegistrationRejectedHandler'
import {RegistrationRejected} from '../../generated/accountLayer_3/accountLayer_3'
import {RemoveMarginHandler} from './handlers/accountLayer/RemoveMarginHandler'
import {RemoveMargin} from '../../generated/accountLayer_3/accountLayer_3'
import {RoleAdminSetHandler} from './handlers/accountLayer/RoleAdminSetHandler'
import {RoleAdminSet} from '../../generated/accountLayer_3/accountLayer_3'
import {RoleGrantedHandler} from './handlers/accountLayer/RoleGrantedHandler'
import {RoleGranted} from '../../generated/accountLayer_3/accountLayer_3'
import {RoleRevokedHandler} from './handlers/accountLayer/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/accountLayer_3/accountLayer_3'
import {SignerScopeUpdatedHandler} from './handlers/accountLayer/SignerScopeUpdatedHandler'
import {SignerScopeUpdated} from '../../generated/accountLayer_3/accountLayer_3'
import {SignerUpdatedHandler} from './handlers/accountLayer/SignerUpdatedHandler'
import {SignerUpdated} from '../../generated/accountLayer_3/accountLayer_3'
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
import {SymmioCoreAddedToAffiliateHandler} from './handlers/accountLayer/SymmioCoreAddedToAffiliateHandler'
import {SymmioCoreAddedToAffiliate} from '../../generated/accountLayer_3/accountLayer_3'
import {SymmioFeeReceiverUpdatedHandler} from './handlers/accountLayer/SymmioFeeReceiverUpdatedHandler'
import {SymmioFeeReceiverUpdated} from '../../generated/accountLayer_3/accountLayer_3'
import {UnpausedHandler} from './handlers/accountLayer/UnpausedHandler'
import {Unpaused} from '../../generated/accountLayer_3/accountLayer_3'
import {VirtualAccountCreatedHandler} from './handlers/accountLayer/VirtualAccountCreatedHandler'
import {VirtualAccountCreated} from '../../generated/accountLayer_3/accountLayer_3'
import {VirtualAccountDeletedHandler} from './handlers/accountLayer/VirtualAccountDeletedHandler'
import {VirtualAccountDeleted} from '../../generated/accountLayer_3/accountLayer_3'
import {VirtualAccountReusedHandler} from './handlers/accountLayer/VirtualAccountReusedHandler'
import {VirtualAccountReused} from '../../generated/accountLayer_3/accountLayer_3'
import {WhitelistedSymmioCoreSetHandler} from './handlers/accountLayer/WhitelistedSymmioCoreSetHandler'
import {WhitelistedSymmioCoreSet} from '../../generated/accountLayer_3/accountLayer_3'
import {ensureSyncMeta} from './src_sync_meta'


export function handleAccountManagerDeployed(event: AccountManagerDeployed): void {
    ensureSyncMeta(event.block)
    let handler = new AccountManagerDeployedHandler<AccountManagerDeployed>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleAccountManagerImplementationUpdated(event: AccountManagerImplementationUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new AccountManagerImplementationUpdatedHandler<AccountManagerImplementationUpdated>()
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


export function handleCall(event: Call): void {
    ensureSyncMeta(event.block)
    let handler = new CallHandler<Call>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleCallAllowedSelectorsSet(event: CallAllowedSelectorsSet): void {
    ensureSyncMeta(event.block)
    let handler = new CallAllowedSelectorsSetHandler<CallAllowedSelectorsSet>()
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


export function handleFeesDistributed(event: FeesDistributed): void {
    ensureSyncMeta(event.block)
    let handler = new FeesDistributedHandler<FeesDistributed>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleHookActionExecuted(event: HookActionExecuted): void {
    ensureSyncMeta(event.block)
    let handler = new HookActionExecutedHandler<HookActionExecuted>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleHookAllowedSelectorsSet(event: HookAllowedSelectorsSet): void {
    ensureSyncMeta(event.block)
    let handler = new HookAllowedSelectorsSetHandler<HookAllowedSelectorsSet>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleHookRemoved(event: HookRemoved): void {
    ensureSyncMeta(event.block)
    let handler = new HookRemovedHandler<HookRemoved>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleHookSet(event: HookSet): void {
    ensureSyncMeta(event.block)
    let handler = new HookSetHandler<HookSet>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleLegacyAccountImported(event: LegacyAccountImported): void {
    ensureSyncMeta(event.block)
    let handler = new LegacyAccountImportedHandler<LegacyAccountImported>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleOperatorSet(event: OperatorSet): void {
    ensureSyncMeta(event.block)
    let handler = new OperatorSetHandler<OperatorSet>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleOwnershipTransferCanceled(event: OwnershipTransferCanceled): void {
    ensureSyncMeta(event.block)
    let handler = new OwnershipTransferCanceledHandler<OwnershipTransferCanceled>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleOwnershipTransferStarted(event: OwnershipTransferStarted): void {
    ensureSyncMeta(event.block)
    let handler = new OwnershipTransferStartedHandler<OwnershipTransferStarted>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    ensureSyncMeta(event.block)
    let handler = new OwnershipTransferredHandler<OwnershipTransferred>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handlePaused(event: Paused): void {
    ensureSyncMeta(event.block)
    let handler = new PausedHandler<Paused>()
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


export function handleRoleAdminSet(event: RoleAdminSet): void {
    ensureSyncMeta(event.block)
    let handler = new RoleAdminSetHandler<RoleAdminSet>()
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


export function handleSignerScopeUpdated(event: SignerScopeUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new SignerScopeUpdatedHandler<SignerScopeUpdated>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleSignerUpdated(event: SignerUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new SignerUpdatedHandler<SignerUpdated>()
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


export function handleSymmioCoreAddedToAffiliate(event: SymmioCoreAddedToAffiliate): void {
    ensureSyncMeta(event.block)
    let handler = new SymmioCoreAddedToAffiliateHandler<SymmioCoreAddedToAffiliate>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleSymmioFeeReceiverUpdated(event: SymmioFeeReceiverUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new SymmioFeeReceiverUpdatedHandler<SymmioFeeReceiverUpdated>()
    handler.handle(event, AccountLayerVersion.v_3)
}


export function handleUnpaused(event: Unpaused): void {
    ensureSyncMeta(event.block)
    let handler = new UnpausedHandler<Unpaused>()
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


export function handleWhitelistedSymmioCoreSet(event: WhitelistedSymmioCoreSet): void {
    ensureSyncMeta(event.block)
    let handler = new WhitelistedSymmioCoreSetHandler<WhitelistedSymmioCoreSet>()
    handler.handle(event, AccountLayerVersion.v_3)
}
