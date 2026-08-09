import {BadDebtAccruedHandler} from './handlers/expressProvider/BadDebtAccruedHandler'
import {BadDebtAccrued} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {CreditBadDebtRepaidHandler} from './handlers/expressProvider/CreditBadDebtRepaidHandler'
import {CreditBadDebtRepaid} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtActivatedHandler} from './handlers/expressProvider/DebtActivatedHandler'
import {DebtActivated} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtCancelledHandler} from './handlers/expressProvider/DebtCancelledHandler'
import {DebtCancelled} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtReservedHandler} from './handlers/expressProvider/DebtReservedHandler'
import {DebtReserved} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {DebtSettledHandler} from './handlers/expressProvider/DebtSettledHandler'
import {DebtSettled} from '../../generated/templates/ExpressProvider/expressProvider_1'
import {ExpressProviderVersion} from '../common/BaseHandler'
import {RequestDebtClearedHandler} from './handlers/expressProvider/RequestDebtClearedHandler'
import {RequestDebtCleared} from '../../generated/templates/ExpressProvider/expressProvider_1'
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


export function handleBadDebtAccrued(event: BadDebtAccrued): void {
    ensureSyncMeta(event.block)
    let handler = new BadDebtAccruedHandler<BadDebtAccrued>()
    handler.handle(event, ExpressProviderVersion.v_1)
}


export function handleCreditBadDebtRepaid(event: CreditBadDebtRepaid): void {
    ensureSyncMeta(event.block)
    let handler = new CreditBadDebtRepaidHandler<CreditBadDebtRepaid>()
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


export function handleRequestDebtCleared(event: RequestDebtCleared): void {
    ensureSyncMeta(event.block)
    let handler = new RequestDebtClearedHandler<RequestDebtCleared>()
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
