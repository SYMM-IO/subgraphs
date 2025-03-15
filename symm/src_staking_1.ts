import { DepositHandler } from "./handlers/staking/DepositHandler"
import {
	Deposit,
	Initialized,
	Paused,
	RescueToken,
	RewardClaimed,
	RewardNotified,
	RoleAdminChanged,
	RoleGranted,
	RoleRevoked,
	Unpaused,
	UpdateWhitelist,
	Withdraw,
} from "../generated/staking_1/staking_1"
import { InitializedHandler } from "./handlers/staking/InitializedHandler"
import { PausedHandler } from "./handlers/staking/PausedHandler"
import { RescueTokenHandler } from "./handlers/staking/RescueTokenHandler"
import { RewardClaimedHandler } from "./handlers/staking/RewardClaimedHandler"
import { RewardNotifiedHandler } from "./handlers/staking/RewardNotifiedHandler"
import { RoleAdminChangedHandler } from "./handlers/staking/RoleAdminChangedHandler"
import { RoleGrantedHandler } from "./handlers/staking/RoleGrantedHandler"
import { RoleRevokedHandler } from "./handlers/staking/RoleRevokedHandler"
import { UnpausedHandler } from "./handlers/staking/UnpausedHandler"
import { UpdateWhitelistHandler } from "./handlers/staking/UpdateWhitelistHandler"
import { SymmStakingVersion } from "../common/BaseHandler"
import { WithdrawHandler } from "./handlers/staking/WithdrawHandler"

export function handleDeposit(event: Deposit): void {
	let handler = new DepositHandler<Deposit>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleInitialized(event: Initialized): void {
	let handler = new InitializedHandler<Initialized>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handlePaused(event: Paused): void {
	let handler = new PausedHandler<Paused>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleRescueToken(event: RescueToken): void {
	let handler = new RescueTokenHandler<RescueToken>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleRewardClaimed(event: RewardClaimed): void {
	let handler = new RewardClaimedHandler<RewardClaimed>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleRewardNotified(event: RewardNotified): void {
	let handler = new RewardNotifiedHandler<RewardNotified>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
	let handler = new RoleAdminChangedHandler<RoleAdminChanged>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleUnpaused(event: Unpaused): void {
	let handler = new UnpausedHandler<Unpaused>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleUpdateWhitelist(event: UpdateWhitelist): void {
	let handler = new UpdateWhitelistHandler<UpdateWhitelist>()
	handler.handle(event, SymmStakingVersion.v_1)
}

export function handleWithdraw(event: Withdraw): void {
	let handler = new WithdrawHandler<Withdraw>()
	handler.handle(event, SymmStakingVersion.v_1)
}
