import {RoleGrantedHandler as CommonRoleGrantedHandler} from "../../../common/handlers/symmio/RoleGrantedHandler"
import {GrantedRole} from "../../../generated/schema"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";
import {rolesNames} from "../../utils/constants";

export class RoleGrantedHandler<T> extends CommonRoleGrantedHandler<T> {
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
			event.params.user.toHexString() +
			"_" +
			event.address.toHexString()
		let gr = new GrantedRole(id)
		gr.role = rolesNames.get(event.params.role.toHexString()) || event.params.role.toHexString()
		gr.user = event.params.user
		gr.contract = event.address
		gr.grantTransaction = event.transaction.hash
		gr.revokeTransaction = null
		gr.updateTimestamp = event.block.timestamp
		gr.save()
	}
}
