import {BaseHandler} from "./BaseHandler"
import {AddAccount} from "../../generated/symmioMultiAccount_0/symmioMultiAccount"

export class AddAccountHandler extends BaseHandler {
	private event: AddAccount

	constructor(event: AddAccount) {
		super(event)
		this.event = event
	}

	handle(): void {
		// TODO
	}
}