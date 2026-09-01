import {AffiliateConfigUpdatedHandler} from './handlers/expressProvider/AffiliateConfigUpdatedHandler'
import {AffiliateConfigUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {AffiliateDepositHandler} from './handlers/expressProvider/AffiliateDepositHandler'
import {AffiliateDeposit} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {AffiliateWithdrawHandler} from './handlers/expressProvider/AffiliateWithdrawHandler'
import {AffiliateWithdraw} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {BadDebtAccruedHandler} from './handlers/expressProvider/BadDebtAccruedHandler'
import {BadDebtAccrued} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CapChangeFeeConfigUpdatedHandler} from './handlers/expressProvider/CapChangeFeeConfigUpdatedHandler'
import {CapChangeFeeConfigUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CapChangeQuotaConfigUpdatedHandler} from './handlers/expressProvider/CapChangeQuotaConfigUpdatedHandler'
import {CapChangeQuotaConfigUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditBadDebtRepaidHandler} from './handlers/expressProvider/CreditBadDebtRepaidHandler'
import {CreditBadDebtRepaid} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditLineAffiliateConfigSelfUpdatedHandler} from './handlers/expressProvider/CreditLineAffiliateConfigSelfUpdatedHandler'
import {CreditLineAffiliateConfigSelfUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditLineAffiliateConfigUpdatedHandler} from './handlers/expressProvider/CreditLineAffiliateConfigUpdatedHandler'
import {CreditLineAffiliateConfigUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditLineMuonConfigUpdatedHandler} from './handlers/expressProvider/CreditLineMuonConfigUpdatedHandler'
import {CreditLineMuonConfigUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditLinePausedUpdatedHandler} from './handlers/expressProvider/CreditLinePausedUpdatedHandler'
import {CreditLinePausedUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditLineProtocolConfigUpdatedHandler} from './handlers/expressProvider/CreditLineProtocolConfigUpdatedHandler'
import {CreditLineProtocolConfigUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditLineUserBlacklistUpdatedHandler} from './handlers/expressProvider/CreditLineUserBlacklistUpdatedHandler'
import {CreditLineUserBlacklistUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtActivatedHandler} from './handlers/expressProvider/DebtActivatedHandler'
import {DebtActivated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtCancelledHandler} from './handlers/expressProvider/DebtCancelledHandler'
import {DebtCancelled} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtReservedHandler} from './handlers/expressProvider/DebtReservedHandler'
import {DebtReserved} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtSettledHandler} from './handlers/expressProvider/DebtSettledHandler'
import {DebtSettled} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {ExpressProviderVersion} from '../common/BaseHandler'
import {FeesClaimedHandler} from './handlers/expressProvider/FeesClaimedHandler'
import {FeesClaimed} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {GeneralBadDebtAccruedHandler} from './handlers/expressProvider/GeneralBadDebtAccruedHandler'
import {GeneralBadDebtAccrued} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {GeneralDepositHandler} from './handlers/expressProvider/GeneralDepositHandler'
import {GeneralDeposit} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {GeneralWithdrawHandler} from './handlers/expressProvider/GeneralWithdrawHandler'
import {GeneralWithdraw} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {MinValidatorSignaturesUpdatedHandler} from './handlers/expressProvider/MinValidatorSignaturesUpdatedHandler'
import {MinValidatorSignaturesUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {OperatorFeesClaimedHandler} from './handlers/expressProvider/OperatorFeesClaimedHandler'
import {OperatorFeesClaimed} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {OwnershipTransferCanceledHandler} from './handlers/expressProvider/OwnershipTransferCanceledHandler'
import {OwnershipTransferCanceled} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {OwnershipTransferStartedHandler} from './handlers/expressProvider/OwnershipTransferStartedHandler'
import {OwnershipTransferStarted} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {OwnershipTransferredHandler} from './handlers/expressProvider/OwnershipTransferredHandler'
import {OwnershipTransferred} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {PausedUpdatedHandler} from './handlers/expressProvider/PausedUpdatedHandler'
import {PausedUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {RequestDebtClearedHandler} from './handlers/expressProvider/RequestDebtClearedHandler'
import {RequestDebtCleared} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {TokensRescuedHandler} from './handlers/expressProvider/TokensRescuedHandler'
import {TokensRescued} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {ValidatorApprovalTimeoutUpdatedHandler} from './handlers/expressProvider/ValidatorApprovalTimeoutUpdatedHandler'
import {ValidatorApprovalTimeoutUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {ValidatorUpdatedHandler} from './handlers/expressProvider/ValidatorUpdatedHandler'
import {ValidatorUpdated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawAcceleratedHandler} from './handlers/expressProvider/WithdrawAcceleratedHandler'
import {WithdrawAccelerated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawAcceptedHandler} from './handlers/expressProvider/WithdrawAcceptedHandler'
import {WithdrawAccepted} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawCancelledHandler} from './handlers/expressProvider/WithdrawCancelledHandler'
import {WithdrawCancelled} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawFinalizedHandler} from './handlers/expressProvider/WithdrawFinalizedHandler'
import {WithdrawFinalized} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawLockedHandler} from './handlers/expressProvider/WithdrawLockedHandler'
import {WithdrawLocked} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawProcessedHandler} from './handlers/expressProvider/WithdrawProcessedHandler'
import {WithdrawProcessed} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawSuspendedHandler} from './handlers/expressProvider/WithdrawSuspendedHandler'
import {WithdrawSuspended} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {WithdrawUnlockedAndProcessedHandler} from './handlers/expressProvider/WithdrawUnlockedAndProcessedHandler'
import {WithdrawUnlockedAndProcessed} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {ensureSyncMeta} from './src_sync_meta'


export function handleAffiliateConfigUpdated(event: AffiliateConfigUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliateConfigUpdatedHandler<AffiliateConfigUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleAffiliateDeposit(event: AffiliateDeposit): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliateDepositHandler<AffiliateDeposit>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleAffiliateWithdraw(event: AffiliateWithdraw): void {
    ensureSyncMeta(event.block)
    let handler = new AffiliateWithdrawHandler<AffiliateWithdraw>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleBadDebtAccrued(event: BadDebtAccrued): void {
    ensureSyncMeta(event.block)
    let handler = new BadDebtAccruedHandler<BadDebtAccrued>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCapChangeFeeConfigUpdated(event: CapChangeFeeConfigUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CapChangeFeeConfigUpdatedHandler<CapChangeFeeConfigUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCapChangeQuotaConfigUpdated(event: CapChangeQuotaConfigUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CapChangeQuotaConfigUpdatedHandler<CapChangeQuotaConfigUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditBadDebtRepaid(event: CreditBadDebtRepaid): void {
    ensureSyncMeta(event.block)
    let handler = new CreditBadDebtRepaidHandler<CreditBadDebtRepaid>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditLineAffiliateConfigSelfUpdated(event: CreditLineAffiliateConfigSelfUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CreditLineAffiliateConfigSelfUpdatedHandler<CreditLineAffiliateConfigSelfUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditLineAffiliateConfigUpdated(event: CreditLineAffiliateConfigUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CreditLineAffiliateConfigUpdatedHandler<CreditLineAffiliateConfigUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditLineMuonConfigUpdated(event: CreditLineMuonConfigUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CreditLineMuonConfigUpdatedHandler<CreditLineMuonConfigUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditLinePausedUpdated(event: CreditLinePausedUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CreditLinePausedUpdatedHandler<CreditLinePausedUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditLineProtocolConfigUpdated(event: CreditLineProtocolConfigUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CreditLineProtocolConfigUpdatedHandler<CreditLineProtocolConfigUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditLineUserBlacklistUpdated(event: CreditLineUserBlacklistUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new CreditLineUserBlacklistUpdatedHandler<CreditLineUserBlacklistUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleDebtActivated(event: DebtActivated): void {
    ensureSyncMeta(event.block)
    let handler = new DebtActivatedHandler<DebtActivated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleDebtCancelled(event: DebtCancelled): void {
    ensureSyncMeta(event.block)
    let handler = new DebtCancelledHandler<DebtCancelled>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleDebtReserved(event: DebtReserved): void {
    ensureSyncMeta(event.block)
    let handler = new DebtReservedHandler<DebtReserved>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleDebtSettled(event: DebtSettled): void {
    ensureSyncMeta(event.block)
    let handler = new DebtSettledHandler<DebtSettled>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleFeesClaimed(event: FeesClaimed): void {
    ensureSyncMeta(event.block)
    let handler = new FeesClaimedHandler<FeesClaimed>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleGeneralBadDebtAccrued(event: GeneralBadDebtAccrued): void {
    ensureSyncMeta(event.block)
    let handler = new GeneralBadDebtAccruedHandler<GeneralBadDebtAccrued>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleGeneralDeposit(event: GeneralDeposit): void {
    ensureSyncMeta(event.block)
    let handler = new GeneralDepositHandler<GeneralDeposit>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleGeneralWithdraw(event: GeneralWithdraw): void {
    ensureSyncMeta(event.block)
    let handler = new GeneralWithdrawHandler<GeneralWithdraw>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleMinValidatorSignaturesUpdated(event: MinValidatorSignaturesUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new MinValidatorSignaturesUpdatedHandler<MinValidatorSignaturesUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleOperatorFeesClaimed(event: OperatorFeesClaimed): void {
    ensureSyncMeta(event.block)
    let handler = new OperatorFeesClaimedHandler<OperatorFeesClaimed>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleOwnershipTransferCanceled(event: OwnershipTransferCanceled): void {
    ensureSyncMeta(event.block)
    let handler = new OwnershipTransferCanceledHandler<OwnershipTransferCanceled>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleOwnershipTransferStarted(event: OwnershipTransferStarted): void {
    ensureSyncMeta(event.block)
    let handler = new OwnershipTransferStartedHandler<OwnershipTransferStarted>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    ensureSyncMeta(event.block)
    let handler = new OwnershipTransferredHandler<OwnershipTransferred>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handlePausedUpdated(event: PausedUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new PausedUpdatedHandler<PausedUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleRequestDebtCleared(event: RequestDebtCleared): void {
    ensureSyncMeta(event.block)
    let handler = new RequestDebtClearedHandler<RequestDebtCleared>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleTokensRescued(event: TokensRescued): void {
    ensureSyncMeta(event.block)
    let handler = new TokensRescuedHandler<TokensRescued>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleValidatorApprovalTimeoutUpdated(event: ValidatorApprovalTimeoutUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new ValidatorApprovalTimeoutUpdatedHandler<ValidatorApprovalTimeoutUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleValidatorUpdated(event: ValidatorUpdated): void {
    ensureSyncMeta(event.block)
    let handler = new ValidatorUpdatedHandler<ValidatorUpdated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawAccelerated(event: WithdrawAccelerated): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawAcceleratedHandler<WithdrawAccelerated>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawAccepted(event: WithdrawAccepted): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawAcceptedHandler<WithdrawAccepted>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawCancelled(event: WithdrawCancelled): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawCancelledHandler<WithdrawCancelled>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawFinalized(event: WithdrawFinalized): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawFinalizedHandler<WithdrawFinalized>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawLocked(event: WithdrawLocked): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawLockedHandler<WithdrawLocked>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawProcessed(event: WithdrawProcessed): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawProcessedHandler<WithdrawProcessed>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawSuspended(event: WithdrawSuspended): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawSuspendedHandler<WithdrawSuspended>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleWithdrawUnlockedAndProcessed(event: WithdrawUnlockedAndProcessed): void {
    ensureSyncMeta(event.block)
    let handler = new WithdrawUnlockedAndProcessedHandler<WithdrawUnlockedAndProcessed>()
    handler.handle(event, ExpressProviderVersion.v_1)
}
