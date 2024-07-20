import { VaultVersion } from "../common/BaseHandler"
import { WithdrawClaimedEventHandler } from "./handlers/on_chain_vault/WithdrawClaimedEventHandler"
import { WithdrawClaimedEvent } from "../generated/on_chain_vault_1/on_chain_vault_1"
import { WithdrawRequestAcceptedEventHandler } from "./handlers/on_chain_vault/WithdrawRequestAcceptedEventHandler"
import { WithdrawRequestAcceptedEvent } from "../generated/on_chain_vault_1/on_chain_vault_1"
import { WithdrawRequestCanceledHandler } from "./handlers/on_chain_vault/WithdrawRequestCanceledHandler"
import { WithdrawRequestCanceled } from "../generated/on_chain_vault_1/on_chain_vault_1"
import { WithdrawRequestEventHandler } from "./handlers/on_chain_vault/WithdrawRequestEventHandler"
import { WithdrawRequestEvent } from "../generated/on_chain_vault_1/on_chain_vault_1"

export function handleWithdrawClaimedEvent(event: WithdrawClaimedEvent): void {
	let handler = new WithdrawClaimedEventHandler<WithdrawClaimedEvent>()
	handler.handle(event, VaultVersion.v_1)
}

export function handleWithdrawRequestEvent(event: WithdrawRequestEvent): void {
	let handler = new WithdrawRequestEventHandler<WithdrawRequestEvent>()
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
