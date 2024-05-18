import { SendQuoteHandler as CommonSendQuoteHandler } from "../../common/handlers/SendQuoteHandler"
import { SendQuote } from "../../generated/symmio/symmio"
import { Account } from "../../generated/schema"
import { getDailyHistoryForTimestamp, getTotalHistory, updateActivityTimestamps } from "../utils"
import { BigInt } from "@graphprotocol/graph-ts"

export class SendQuoteHandler extends CommonSendQuoteHandler {

	constructor(event: SendQuote) {
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
