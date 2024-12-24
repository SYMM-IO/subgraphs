import {DepositHandler} from './handlers/vault/DepositHandler'
import {Deposit} from '../generated/vault_1/vault_1'
import {VaultVersion} from '../common/BaseHandler'
import {WithdrawClaimedEventHandler} from './handlers/vault/WithdrawClaimedEventHandler'
import {WithdrawClaimedEvent} from '../generated/vault_1/vault_1'
import {WithdrawRequestAcceptedEventHandler} from './handlers/vault/WithdrawRequestAcceptedEventHandler'
import {WithdrawRequestAcceptedEvent} from '../generated/vault_1/vault_1'
import {WithdrawRequestCanceledHandler} from './handlers/vault/WithdrawRequestCanceledHandler'
import {WithdrawRequestCanceled} from '../generated/vault_1/vault_1'
import {WithdrawRequestEventHandler} from './handlers/vault/WithdrawRequestEventHandler'
import {WithdrawRequestEvent} from '../generated/vault_1/vault_1'


export function handleDeposit(event: Deposit): void {
    let handler = new DepositHandler<Deposit>()
    handler.handle(event, VaultVersion.v_1)
}


export function handleWithdrawClaimedEvent(event: WithdrawClaimedEvent): void {
    let handler = new WithdrawClaimedEventHandler<WithdrawClaimedEvent>()
    handler.handle(event, VaultVersion.v_1)
}


export function handleWithdrawRequestAcceptedEvent(event: WithdrawRequestAcceptedEvent): void {
    let handler = new WithdrawRequestAcceptedEventHandler<WithdrawRequestAcceptedEvent>()
    handler.handle(event, VaultVersion.v_1)
}


export function handleWithdrawRequestCanceled(event: WithdrawRequestCanceled): void {
    let handler = new WithdrawRequestCanceledHandler<WithdrawRequestCanceled>()
    handler.handle(event, VaultVersion.v_1)
}


export function handleWithdrawRequestEvent(event: WithdrawRequestEvent): void {
    let handler = new WithdrawRequestEventHandler<WithdrawRequestEvent>()
    handler.handle(event, VaultVersion.v_1)
}
