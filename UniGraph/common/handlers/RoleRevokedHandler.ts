import { BaseHandler } from "./BaseHandler"
import { RoleRevoked } from "../../generated/symmio/symmio"

export class RoleRevokedHandler extends BaseHandler {
	protected event: RoleRevoked

	constructor(event: RoleRevoked) {
		super(event)
		this.event = event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}