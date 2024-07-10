import {RoleRevokedHandler as CommonRoleRevokedHandler} from "../../../common/handlers/symmioMultiAccount/RoleRevokedHandler"
import {GrantedRole} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {rolesNames} from "../../utils/constants";

export class RoleRevokedHandler<T> extends CommonRoleRevokedHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let id =
			rolesNames.get(event.params.role.toHexString()) +
			"_" +
			event.params.account.toHexString() +
			"_" +
			event.address.toHexString()
		let gr = GrantedRole.load(id)
		if (gr == null) {
			gr = new GrantedRole(id)
			gr.role = rolesNames.get(event.params.role.toHexString()) || event.params.role.toHexString()
			gr.user = event.params.account
			gr.contract = event.address
		}
		gr.updateTimestamp = event.block.timestamp
		gr.revokeTransaction = event.transaction.hash
		gr.save()
	}
}
