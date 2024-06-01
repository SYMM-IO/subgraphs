import { BaseHandler } from "./BaseHandler"
import { RoleGranted } from "../../generated/symmioMultiAccount_0/symmioMultiAccount"

export class RoleGrantedHandler extends BaseHandler {
	protected event: RoleGranted

	constructor(event: RoleGranted) {
		super(event)
		this.event = event
	}

	protected getEvent(): RoleGranted {
		return this.event
	}

	handle(): void {
	}

	handleQuote(): void {
	}
}