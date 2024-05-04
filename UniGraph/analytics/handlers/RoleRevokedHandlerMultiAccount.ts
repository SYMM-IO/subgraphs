import { RoleRevokedHandler as CommonRoleRevokedHandler } from "../../common/handlers/RoleRevokedHandlerMultiAccount"
import { RoleRevoked } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"

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
	}
}
