import {AccountLayerVersion} from '../common/BaseHandler'
import {AccountManagerDeployedHandler} from './handlers/accountLayer/AccountManagerDeployedHandler'
import {AccountManagerDeployed} from '../../generated/accountLayer_1/accountLayer_1'
import {AccountManagerImplementationUpdatedHandler} from './handlers/accountLayer/AccountManagerImplementationUpdatedHandler'
import {AccountManagerImplementationUpdated} from '../../generated/accountLayer_1/accountLayer_1'
import {AddMarginHandler} from './handlers/accountLayer/AddMarginHandler'
import {AddMargin} from '../../generated/accountLayer_1/accountLayer_1'
import {AdminTransferCancelledHandler} from './handlers/accountLayer/AdminTransferCancelledHandler'
import {AdminTransferCancelled} from '../../generated/accountLayer_1/accountLayer_1'
import {AdminTransferCompletedHandler} from './handlers/accountLayer/AdminTransferCompletedHandler'
import {AdminTransferCompleted} from '../../generated/accountLayer_1/accountLayer_1'
import {AdminTransferProposedHandler} from './handlers/accountLayer/AdminTransferProposedHandler'
import {AdminTransferProposed} from '../../generated/accountLayer_1/accountLayer_1'
import {AffiliateApprovedHandler} from './handlers/accountLayer/AffiliateApprovedHandler'
import {AffiliateApproved} from '../../generated/accountLayer_1/accountLayer_1'
import {AffiliatePausedHandler} from './handlers/accountLayer/AffiliatePausedHandler'
import {AffiliatePaused} from '../../generated/accountLayer_1/accountLayer_1'
import {AffiliateRegisteredHandler} from './handlers/accountLayer/AffiliateRegisteredHandler'
import {AffiliateRegistered} from '../../generated/accountLayer_1/accountLayer_1'
import {AffiliateUnpausedHandler} from './handlers/accountLayer/AffiliateUnpausedHandler'
import {AffiliateUnpaused} from '../../generated/accountLayer_1/accountLayer_1'
import {AffiliateUpdatedHandler} from './handlers/accountLayer/AffiliateUpdatedHandler'
import {AffiliateUpdated} from '../../generated/accountLayer_1/accountLayer_1'
import {CallAllowedSelectorsSetHandler} from './handlers/accountLayer/CallAllowedSelectorsSetHandler'
import {CallAllowedSelectorsSet} from '../../generated/accountLayer_1/accountLayer_1'
import {CallHandler} from './handlers/accountLayer/CallHandler'
import {Call} from '../../generated/accountLayer_1/accountLayer_1'
import {EditAccountNameHandler} from './handlers/accountLayer/EditAccountNameHandler'
import {EditAccountName} from '../../generated/accountLayer_1/accountLayer_1'
import {EmergencyMarginRecoveredHandler} from './handlers/accountLayer/EmergencyMarginRecoveredHandler'
import {EmergencyMarginRecovered} from '../../generated/accountLayer_1/accountLayer_1'
import {ExpressRateSetHandler} from './handlers/accountLayer/ExpressRateSetHandler'
import {ExpressRateSet} from '../../generated/accountLayer_1/accountLayer_1'
import {FeeUpdateCancelledHandler} from './handlers/accountLayer/FeeUpdateCancelledHandler'
import {FeeUpdateCancelled} from '../../generated/accountLayer_1/accountLayer_1'
import {FeesClaimedHandler} from './handlers/accountLayer/FeesClaimedHandler'
import {FeesClaimed} from '../../generated/accountLayer_1/accountLayer_1'
import {FeesDistributedHandler} from './handlers/accountLayer/FeesDistributedHandler'
import {FeesDistributed} from '../../generated/accountLayer_1/accountLayer_1'
import {HookActionExecutedHandler} from './handlers/accountLayer/HookActionExecutedHandler'
import {HookActionExecuted} from '../../generated/accountLayer_1/accountLayer_1'
import {HookAllowedSelectorsSetHandler} from './handlers/accountLayer/HookAllowedSelectorsSetHandler'
import {HookAllowedSelectorsSet} from '../../generated/accountLayer_1/accountLayer_1'
import {HookRemovedHandler} from './handlers/accountLayer/HookRemovedHandler'
import {HookRemoved} from '../../generated/accountLayer_1/accountLayer_1'
import {HookSetHandler} from './handlers/accountLayer/HookSetHandler'
import {HookSet} from '../../generated/accountLayer_1/accountLayer_1'
import {LegacyAccountImportedHandler} from './handlers/accountLayer/LegacyAccountImportedHandler'
import {LegacyAccountImported} from '../../generated/accountLayer_1/accountLayer_1'
import {OperatorSetHandler} from './handlers/accountLayer/OperatorSetHandler'
import {OperatorSet} from '../../generated/accountLayer_1/accountLayer_1'
import {PausedHandler} from './handlers/accountLayer/PausedHandler'
import {Paused} from '../../generated/accountLayer_1/accountLayer_1'
import {RegistrationCancelledHandler} from './handlers/accountLayer/RegistrationCancelledHandler'
import {RegistrationCancelled} from '../../generated/accountLayer_1/accountLayer_1'
import {RegistrationRejectedHandler} from './handlers/accountLayer/RegistrationRejectedHandler'
import {RegistrationRejected} from '../../generated/accountLayer_1/accountLayer_1'
import {RemoveMarginHandler} from './handlers/accountLayer/RemoveMarginHandler'
import {RemoveMargin} from '../../generated/accountLayer_1/accountLayer_1'
import {RoleAdminSetHandler} from './handlers/accountLayer/RoleAdminSetHandler'
import {RoleAdminSet} from '../../generated/accountLayer_1/accountLayer_1'
import {RoleGrantedHandler} from './handlers/accountLayer/RoleGrantedHandler'
import {RoleGranted} from '../../generated/accountLayer_1/accountLayer_1'
import {RoleRevokedHandler} from './handlers/accountLayer/RoleRevokedHandler'
import {RoleRevoked} from '../../generated/accountLayer_1/accountLayer_1'
import {SignerUpdatedHandler} from './handlers/accountLayer/SignerUpdatedHandler'
import {SignerUpdated} from '../../generated/accountLayer_1/accountLayer_1'
import {SingleVAModeChangedHandler} from './handlers/accountLayer/SingleVAModeChangedHandler'
import {SingleVAModeChanged} from '../../generated/accountLayer_1/accountLayer_1'
import {StakeholdersUpdateRequestedHandler} from './handlers/accountLayer/StakeholdersUpdateRequestedHandler'
import {StakeholdersUpdateRequested} from '../../generated/accountLayer_1/accountLayer_1'
import {StakeholdersUpdatedHandler} from './handlers/accountLayer/StakeholdersUpdatedHandler'
import {StakeholdersUpdated} from '../../generated/accountLayer_1/accountLayer_1'
import {SubAccountCreatedHandler} from './handlers/accountLayer/SubAccountCreatedHandler'
import {SubAccountCreated} from '../../generated/accountLayer_1/accountLayer_1'
import {SubAccountDeletedHandler} from './handlers/accountLayer/SubAccountDeletedHandler'
import {SubAccountDeleted} from '../../generated/accountLayer_1/accountLayer_1'
import {SymmioFeeReceiverUpdatedHandler} from './handlers/accountLayer/SymmioFeeReceiverUpdatedHandler'
import {SymmioFeeReceiverUpdated} from '../../generated/accountLayer_1/accountLayer_1'
import {UnpausedHandler} from './handlers/accountLayer/UnpausedHandler'
import {Unpaused} from '../../generated/accountLayer_1/accountLayer_1'
import {VirtualAccountCreatedHandler} from './handlers/accountLayer/VirtualAccountCreatedHandler'
import {VirtualAccountCreated} from '../../generated/accountLayer_1/accountLayer_1'
import {VirtualAccountDeletedHandler} from './handlers/accountLayer/VirtualAccountDeletedHandler'
import {VirtualAccountDeleted} from '../../generated/accountLayer_1/accountLayer_1'
import {VirtualAccountReusedHandler} from './handlers/accountLayer/VirtualAccountReusedHandler'
import {VirtualAccountReused} from '../../generated/accountLayer_1/accountLayer_1'
import {VirtualProviderSetHandler} from './handlers/accountLayer/VirtualProviderSetHandler'
import {VirtualProviderSet} from '../../generated/accountLayer_1/accountLayer_1'
import {WhitelistedSymmioCoreSetHandler} from './handlers/accountLayer/WhitelistedSymmioCoreSetHandler'
import {WhitelistedSymmioCoreSet} from '../../generated/accountLayer_1/accountLayer_1'


export function handleAccountManagerDeployed(event: AccountManagerDeployed): void {
    let handler = new AccountManagerDeployedHandler<AccountManagerDeployed>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAccountManagerImplementationUpdated(event: AccountManagerImplementationUpdated): void {
    let handler = new AccountManagerImplementationUpdatedHandler<AccountManagerImplementationUpdated>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAddMargin(event: AddMargin): void {
    let handler = new AddMarginHandler<AddMargin>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAdminTransferCancelled(event: AdminTransferCancelled): void {
    let handler = new AdminTransferCancelledHandler<AdminTransferCancelled>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAdminTransferCompleted(event: AdminTransferCompleted): void {
    let handler = new AdminTransferCompletedHandler<AdminTransferCompleted>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAdminTransferProposed(event: AdminTransferProposed): void {
    let handler = new AdminTransferProposedHandler<AdminTransferProposed>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAffiliateApproved(event: AffiliateApproved): void {
    let handler = new AffiliateApprovedHandler<AffiliateApproved>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAffiliatePaused(event: AffiliatePaused): void {
    let handler = new AffiliatePausedHandler<AffiliatePaused>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAffiliateRegistered(event: AffiliateRegistered): void {
    let handler = new AffiliateRegisteredHandler<AffiliateRegistered>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAffiliateUnpaused(event: AffiliateUnpaused): void {
    let handler = new AffiliateUnpausedHandler<AffiliateUnpaused>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleAffiliateUpdated(event: AffiliateUpdated): void {
    let handler = new AffiliateUpdatedHandler<AffiliateUpdated>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleCall(event: Call): void {
    let handler = new CallHandler<Call>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleCallAllowedSelectorsSet(event: CallAllowedSelectorsSet): void {
    let handler = new CallAllowedSelectorsSetHandler<CallAllowedSelectorsSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleEditAccountName(event: EditAccountName): void {
    let handler = new EditAccountNameHandler<EditAccountName>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleEmergencyMarginRecovered(event: EmergencyMarginRecovered): void {
    let handler = new EmergencyMarginRecoveredHandler<EmergencyMarginRecovered>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleExpressRateSet(event: ExpressRateSet): void {
    let handler = new ExpressRateSetHandler<ExpressRateSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleFeeUpdateCancelled(event: FeeUpdateCancelled): void {
    let handler = new FeeUpdateCancelledHandler<FeeUpdateCancelled>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleFeesClaimed(event: FeesClaimed): void {
    let handler = new FeesClaimedHandler<FeesClaimed>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleFeesDistributed(event: FeesDistributed): void {
    let handler = new FeesDistributedHandler<FeesDistributed>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleHookActionExecuted(event: HookActionExecuted): void {
    let handler = new HookActionExecutedHandler<HookActionExecuted>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleHookAllowedSelectorsSet(event: HookAllowedSelectorsSet): void {
    let handler = new HookAllowedSelectorsSetHandler<HookAllowedSelectorsSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleHookRemoved(event: HookRemoved): void {
    let handler = new HookRemovedHandler<HookRemoved>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleHookSet(event: HookSet): void {
    let handler = new HookSetHandler<HookSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleLegacyAccountImported(event: LegacyAccountImported): void {
    let handler = new LegacyAccountImportedHandler<LegacyAccountImported>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleOperatorSet(event: OperatorSet): void {
    let handler = new OperatorSetHandler<OperatorSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handlePaused(event: Paused): void {
    let handler = new PausedHandler<Paused>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleRegistrationCancelled(event: RegistrationCancelled): void {
    let handler = new RegistrationCancelledHandler<RegistrationCancelled>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleRegistrationRejected(event: RegistrationRejected): void {
    let handler = new RegistrationRejectedHandler<RegistrationRejected>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleRemoveMargin(event: RemoveMargin): void {
    let handler = new RemoveMarginHandler<RemoveMargin>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleRoleAdminSet(event: RoleAdminSet): void {
    let handler = new RoleAdminSetHandler<RoleAdminSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleRoleGranted(event: RoleGranted): void {
    let handler = new RoleGrantedHandler<RoleGranted>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleRoleRevoked(event: RoleRevoked): void {
    let handler = new RoleRevokedHandler<RoleRevoked>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleSignerUpdated(event: SignerUpdated): void {
    let handler = new SignerUpdatedHandler<SignerUpdated>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleSingleVAModeChanged(event: SingleVAModeChanged): void {
    let handler = new SingleVAModeChangedHandler<SingleVAModeChanged>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleStakeholdersUpdateRequested(event: StakeholdersUpdateRequested): void {
    let handler = new StakeholdersUpdateRequestedHandler<StakeholdersUpdateRequested>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleStakeholdersUpdated(event: StakeholdersUpdated): void {
    let handler = new StakeholdersUpdatedHandler<StakeholdersUpdated>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleSubAccountCreated(event: SubAccountCreated): void {
    let handler = new SubAccountCreatedHandler<SubAccountCreated>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleSubAccountDeleted(event: SubAccountDeleted): void {
    let handler = new SubAccountDeletedHandler<SubAccountDeleted>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleSymmioFeeReceiverUpdated(event: SymmioFeeReceiverUpdated): void {
    let handler = new SymmioFeeReceiverUpdatedHandler<SymmioFeeReceiverUpdated>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleUnpaused(event: Unpaused): void {
    let handler = new UnpausedHandler<Unpaused>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleVirtualAccountCreated(event: VirtualAccountCreated): void {
    let handler = new VirtualAccountCreatedHandler<VirtualAccountCreated>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleVirtualAccountDeleted(event: VirtualAccountDeleted): void {
    let handler = new VirtualAccountDeletedHandler<VirtualAccountDeleted>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleVirtualAccountReused(event: VirtualAccountReused): void {
    let handler = new VirtualAccountReusedHandler<VirtualAccountReused>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleVirtualProviderSet(event: VirtualProviderSet): void {
    let handler = new VirtualProviderSetHandler<VirtualProviderSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}


export function handleWhitelistedSymmioCoreSet(event: WhitelistedSymmioCoreSet): void {
    let handler = new WhitelistedSymmioCoreSetHandler<WhitelistedSymmioCoreSet>()
    handler.handle(event, AccountLayerVersion.v_1)
}
