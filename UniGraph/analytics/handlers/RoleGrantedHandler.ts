import { RoleGrantedHandler as CommonRoleGrantedHandler } from "../../common/handlers/RoleGrantedHandler"
import { RoleGranted } from "../../generated/symmio/symmio"

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
