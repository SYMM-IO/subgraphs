import { SubAccountCreatedHandler } from "./handlers/accountLayer/SubAccountCreatedHandler"
import {
	EditAccountName,
	LegacyAccountImported,
	RoleGranted,
	RoleRevoked,
	SingleVAModeChanged,
	SubAccountCreated,
	SubAccountDeleted,
	VirtualAccountCreated,
	VirtualAccountDeleted,
	VirtualAccountReused,
} from "../../generated/accountLayer_1/accountLayer_1"
import { EditAccountNameHandler } from "./handlers/accountLayer/EditAccountNameHandler"
import { LegacyAccountImportedHandler } from "./handlers/accountLayer/LegacyAccountImportedHandler"
import { RoleGrantedHandler } from "./handlers/accountLayer/RoleGrantedHandler"
import { RoleRevokedHandler } from "./handlers/accountLayer/RoleRevokedHandler"
import { SingleVAModeChangedHandler } from "./handlers/accountLayer/SingleVAModeChangedHandler"
import { SubAccountDeletedHandler } from "./handlers/accountLayer/SubAccountDeletedHandler"
import { VirtualAccountCreatedHandler } from "./handlers/accountLayer/VirtualAccountCreatedHandler"
import { VirtualAccountDeletedHandler } from "./handlers/accountLayer/VirtualAccountDeletedHandler"
import { VirtualAccountReusedHandler } from "./handlers/accountLayer/VirtualAccountReusedHandler"
import { AccountLayerVersion } from "../common/BaseHandler"

export function handleSubAccountCreated(event: SubAccountCreated): void {
	let handler = new SubAccountCreatedHandler<SubAccountCreated>()
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

export function handleEditAccountName(event: EditAccountName): void {
	let handler = new EditAccountNameHandler<EditAccountName>()
	handler.handle(event, AccountLayerVersion.v_1)
}

export function handleLegacyAccountImported(event: LegacyAccountImported): void {
	let handler = new LegacyAccountImportedHandler<LegacyAccountImported>()
	handler.handle(event, AccountLayerVersion.v_1)
}

export function handleSingleVAModeChanged(event: SingleVAModeChanged): void {
	let handler = new SingleVAModeChangedHandler<SingleVAModeChanged>()
	handler.handle(event, AccountLayerVersion.v_1)
}

export function handleSubAccountDeleted(event: SubAccountDeleted): void {
	let handler = new SubAccountDeletedHandler<SubAccountDeleted>()
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
