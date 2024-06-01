import { RoleRevokedHandler as CommonRoleRevokedHandler } from "../../common/handlers/RoleRevokedHandlerMultiAccount"
import { RoleRevoked } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"
import { GrantedRole } from "../../generated/schema"
import { rolesNames } from "../utils"

export class RoleRevokedHandler extends CommonRoleRevokedHandler {
	constructor(event: RoleRevoked) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		let event = super.getEvent()

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
