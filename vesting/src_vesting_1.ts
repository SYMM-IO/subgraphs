import { VestingPlanReset, VestingPlanSetup } from "../generated/vesting_1/vesting_1"
import { SymmVestingVersion } from "./BaseHandler"
import { VestingPlanResetHandler } from "./handlers/vesting/VestingPlanResetHandler"
import { VestingPlanSetupHandler } from "./handlers/vesting/VestingPlanSetupHandler"

export function handleVestingPlanReset(event: VestingPlanReset): void {
	let handler = new VestingPlanResetHandler<VestingPlanReset>()
	handler.handle(event, SymmVestingVersion.v_1)
}

export function handleVestingPlanSetup(event: VestingPlanSetup): void {
	let handler = new VestingPlanSetupHandler<VestingPlanSetup>()
	handler.handle(event, SymmVestingVersion.v_1)
}
