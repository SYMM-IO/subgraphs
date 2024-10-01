import {
	RoleRevokedHandler as CommonRoleRevokedHandler
} from "../../../common/handlers/symmioMultiAccount/RoleRevokedHandler"
import {GrantedRole} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {MultiAccountVersion} from "../../../common/BaseHandler";
import {getRoleName} from "../../utils/constants";

export class RoleRevokedHandler<T> extends CommonRoleRevokedHandler<T> {
	handle(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleAccount(_event, version)

		let id =
			getRoleName(event.params.role.toHexString()) +
			"_" +
			event.params.account.toHexString() +
			"_" +
			event.address.toHexString()
		let gr = GrantedRole.load(id)
		if (gr == null) {
			gr = new GrantedRole(id)
			gr.role = getRoleName(event.params.role.toHexString())
			gr.user = event.params.account
			gr.contract = event.address
		}
		gr.updateTimestamp = event.block.timestamp
		gr.revokeTransaction = event.transaction.hash
		gr.save()
	}
}
