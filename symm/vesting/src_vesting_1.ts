import { InitializedHandler } from "../handlers/vesting/InitializedHandler"
import {
	Initialized,
	LiquidityAdded,
	LockedTokenClaimed,
	Paused,
	RoleAdminChanged,
	RoleGranted,
	RoleRevoked,
	UnlockedTokenClaimed,
	Unpaused,
	VestingPlanReset,
	VestingPlanSetup,
} from "../../generated/vesting_1/vesting_1"
import { LiquidityAddedHandler } from "../handlers/vesting/LiquidityAddedHandler"
import { LockedTokenClaimedHandler } from "../handlers/vesting/LockedTokenClaimedHandler"
import { PausedHandler } from "../handlers/vesting/PausedHandler"
import { RoleAdminChangedHandler } from "../handlers/vesting/RoleAdminChangedHandler"
import { RoleGrantedHandler } from "../handlers/vesting/RoleGrantedHandler"
import { RoleRevokedHandler } from "../handlers/vesting/RoleRevokedHandler"
import { UnlockedTokenClaimedHandler } from "../handlers/vesting/UnlockedTokenClaimedHandler"
import { UnpausedHandler } from "../handlers/vesting/UnpausedHandler"
import { SymmVestingVersion } from "../../common/BaseHandler"
import { VestingPlanResetHandler } from "../handlers/vesting/VestingPlanResetHandler"
import { VestingPlanSetupHandler } from "../handlers/vesting/VestingPlanSetupHandler"

export function handleInitialized(event: Initialized): void {
	let handler = new InitializedHandler<Initialized>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleLiquidityAdded(event: LiquidityAdded): void {
	let handler = new LiquidityAddedHandler<LiquidityAdded>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleLockedTokenClaimed(event: LockedTokenClaimed): void {
	let handler = new LockedTokenClaimedHandler<LockedTokenClaimed>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handlePaused(event: Paused): void {
	let handler = new PausedHandler<Paused>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {
	let handler = new RoleAdminChangedHandler<RoleAdminChanged>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleRoleGranted(event: RoleGranted): void {
	let handler = new RoleGrantedHandler<RoleGranted>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleRoleRevoked(event: RoleRevoked): void {
	let handler = new RoleRevokedHandler<RoleRevoked>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleUnlockedTokenClaimed(event: UnlockedTokenClaimed): void {
	let handler = new UnlockedTokenClaimedHandler<UnlockedTokenClaimed>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleUnpaused(event: Unpaused): void {
	let handler = new UnpausedHandler<Unpaused>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleVestingPlanReset(event: VestingPlanReset): void {
	let handler = new VestingPlanResetHandler<VestingPlanReset>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleVestingPlanSetup(event: VestingPlanSetup): void {
	let handler = new VestingPlanSetupHandler<VestingPlanSetup>()
	handler.handle(event, SymmVestingVersion.v_1)
}
