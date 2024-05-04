import { RoleRevokedHandler as CommonRoleRevokedHandler } from "../../common/handlers/RoleRevokedHandler"
import { RoleRevoked } from "../../generated/symmio/symmio"

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
