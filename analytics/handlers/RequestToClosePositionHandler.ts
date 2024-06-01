import { RequestToClosePositionHandler as CommonRequestToClosePositionHandler } from "../../common/handlers/RequestToClosePositionHandler"
import { RequestToClosePosition } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"
import { updateActivityTimestamps } from "../utils"

export class RequestToClosePositionHandler extends CommonRequestToClosePositionHandler {

	constructor(event: RequestToClosePosition) {
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
