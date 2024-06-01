import {
	RequestToCancelCloseRequestHandler as CommonRequestToCancelCloseRequestHandler,
} from "../../common/handlers/RequestToCancelCloseRequestHandler"
import { RequestToCancelCloseRequest } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"
import { updateActivityTimestamps } from "../utils"

export class RequestToCancelCloseRequestHandler extends CommonRequestToCancelCloseRequestHandler {

	constructor(event: RequestToCancelCloseRequest) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		const event = this.getEvent()
		let account = Account.load(event.params.partyA.toHexString())!
		updateActivityTimestamps(account, event.block.timestamp)
	}
}
