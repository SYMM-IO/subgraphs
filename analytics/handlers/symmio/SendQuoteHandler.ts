import {
	SendQuoteHandlerWithAccount as CommonSendQuoteHandler
} from "../../../common/handlers/symmio/SendQuoteHandlerWithAccount"
import {Account} from "../../../generated/schema"
import {getDailyHistoryForTimestamp, getTotalHistory, updateActivityTimestamps} from "../../utils"
import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {Version} from "../../../common/BaseHandler";

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

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
		dh.quotesCount = dh.quotesCount.plus(BigInt.fromString("1"))
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(event.block.timestamp, account.accountSource)
		th.quotesCount = th.quotesCount.plus(BigInt.fromString("1"))
		th.updateTimestamp = event.block.timestamp
		th.save()
	}
}
