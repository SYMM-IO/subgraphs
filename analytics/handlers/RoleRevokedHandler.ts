import { RoleRevokedHandler as CommonRoleRevokedHandler } from "../../common/handlers/RoleRevokedHandler"
import { GrantedRole } from "../../generated/schema"
import { RoleRevoked } from "../../generated/symmio/symmio"
import { rolesNames } from "../utils"

export class RoleRevokedHandler extends CommonRoleRevokedHandler {
	constructor(event: RoleRevoked) {
		super(event)
	}

	handle(): void {
		super.handle()
		const globalCounter = super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		let event = super.getEvent()

		let id =
			rolesNames.get(event.params.role.toHexString()) +
			"_" +
			event.params.user.toHexString() +
			"_" +
			event.address.toHexString()
		let gr = GrantedRole.load(id)
		if (gr == null) {
			gr = new GrantedRole(id)
			gr.role = rolesNames.get(event.params.role.toHexString()) || event.params.role.toHexString()
			gr.user = event.params.user
			gr.contract = event.address
		}
		gr.updateTimestamp = event.block.timestamp
		gr.revokeTransaction = event.transaction.hash
		gr.save()
	}
}
