import { RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler } from "../../common/handlers/RequestToCancelQuoteHandler"
import { RequestToCancelQuote } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"
import { updateActivityTimestamps } from "./utils"

export class RequestToCancelQuoteHandler extends CommonRequestToCancelQuoteHandler {

	constructor(event: RequestToCancelQuote) {
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
