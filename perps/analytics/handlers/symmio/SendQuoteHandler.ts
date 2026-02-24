import { SendQuoteHandlerWithAccount as CommonSendQuoteHandler } from "../../../common/handlers/symmio/SendQuoteHandlerWithAccount"
import { Account, Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateActivityTimestamps } from "../../utils/activityHelpers"
import { catchUpHistories } from "../../utils/openInterestHelpers"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"

export class SendQuoteHandler<T> extends CommonSendQuoteHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleAccount(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		updateActivityTimestamps(account, event.block.timestamp, event.address)

		updateHistories(new UpdateHistoriesParams(version, account, null, event).quotesCount(BigInt.fromString("1")))
		catchUpHistories(_event.block.timestamp, event.address)

		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		let builder = new JSONBuilder()
		if (quote.symbolId) builder.add("symbolId", quote.symbolId!.toString())
		if (quote.quantity) builder.add("quantity", quote.quantity!.toString())
		if (quote.requestedOpenPrice) builder.add("requestedOpenPrice", quote.requestedOpenPrice!.toString())
		builder.add("positionType", quote.positionType.toString())
		builder.addNullable("orderType", quote.orderTypeOpen ? quote.orderTypeOpen!.toString() : null)
		builder.addNullable("cva", quote.cva ? quote.cva!.toString() : null)
		builder.addNullable("lf", quote.lf ? quote.lf!.toString() : null)
		builder.addNullable("partyAmm", quote.partyAmm ? quote.partyAmm!.toString() : null)
		builder.addNullable("partyBmm", quote.partyBmm ? quote.partyBmm!.toString() : null)
		builder.addNullable("deadline", quote.openDeadline ? quote.openDeadline!.toString() : null)
		createQuoteEvent(_event, event.params.quoteId, "SEND_QUOTE", builder.build())
	}
}
