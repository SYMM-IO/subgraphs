import {
	RequestToCancelQuoteHandler as CommonRequestToCancelQuoteHandler
} from "../../../common/handlers/symmio/RequestToCancelQuoteHandler"
import {Account} from "../../../generated/schema"
import {updateActivityTimestamps} from "../../utils"
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class RequestToCancelQuoteHandler<T> extends CommonRequestToCancelQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.partyA.toHexString())!
		updateActivityTimestamps(account, event.block.timestamp)
	}
}
