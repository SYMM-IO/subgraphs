import { BaseHandler } from "./BaseHandler"
import { RoleRevoked } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"

export class RoleRevokedHandler extends BaseHandler {
	protected event: RoleRevoked

	constructor(event: RoleRevoked) {
		super(event)
		this.event = event
	}
	
	protected getEvent(): RoleRevoked {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}