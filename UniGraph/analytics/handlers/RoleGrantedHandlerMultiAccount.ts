import { RoleGrantedHandler as CommonRoleGrantedHandler } from "../../common/handlers/RoleGrantedHandlerMultiAccount"
import { RoleGranted } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"

export class RoleGrantedHandler extends CommonRoleGrantedHandler {

	constructor(event: RoleGranted) {
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
