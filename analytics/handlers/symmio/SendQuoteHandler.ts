import {
	SendQuoteHandlerWithAccount as CommonSendQuoteHandler
} from "../../../common/handlers/symmio/SendQuoteHandlerWithAccount"
import {Account} from "../../../generated/schema"
import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {Version} from "../../../common/BaseHandler";

import {updateActivityTimestamps, updateHistories, UpdateHistoriesParams} from "../../utils/helpers";

export class SendQuoteHandler<T> extends CommonSendQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.partyA.toHexString())!
		updateActivityTimestamps(account, event.block.timestamp)

		updateHistories(
			new UpdateHistoriesParams(account, event.block.timestamp)
				.quotesCount(BigInt.fromString("1"))
		)
	}
}
