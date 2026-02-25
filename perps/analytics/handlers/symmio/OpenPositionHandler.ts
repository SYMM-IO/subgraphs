import { OpenPositionHandlerWithAccount as CommonOpenPositionHandler } from "../../../common/handlers/symmio/OpenPositionHandlerWithAccount"
import { Account, Quote, Symbol } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"

export class OpenPositionHandler<T> extends CommonOpenPositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		let volume = unDecimal(event.params.filledAmount.times(event.params.openedPrice))

		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return
		const symbol = Symbol.load(quote.symbolId!.toString() + "-" + event.address.toHexString())
		if (!symbol) return

		let tradingFee = event.params.filledAmount.times(quote.openedPrice!).times(symbol.tradingFee).div(BigInt.fromString("10").pow(36))

		let solverAccount = Account.load(event.params.partyB.toHexString())
		if (!solverAccount) return

		updateHistories(
			new UpdateHistoriesParams(version, account, solverAccount, event)
				.openTradeVolume(volume)
				.symbolId(quote.symbolId!)
				.positionsCount(BigInt.fromI32(1))
				.openFee(tradingFee),
		)
		if (_event.block.timestamp > BigInt.fromI32(1723852800)) {
			// From this timestamp we count partyB volumes in analytics as well
			updateHistories(
				new UpdateHistoriesParams(version, solverAccount, null, event, account.accountSource).openTradeVolume(volume).symbolId(quote.symbolId!),
			)
		}
		updateDailyOpenInterest(event.block.timestamp, volume, true, solverAccount, account.accountSource, event.address)

		createQuoteEvent(
			_event,
			event.params.quoteId,
			"OPEN_POSITION",
			new JSONBuilder()
				.add("filledAmount", event.params.filledAmount.toString())
				.add("openedPrice", event.params.openedPrice.toString())
				.addNullable("cva", quote.cva ? quote.cva!.toString() : null)
				.addNullable("lf", quote.lf ? quote.lf!.toString() : null)
				.addNullable("partyAmm", quote.partyAmm ? quote.partyAmm!.toString() : null)
				.addNullable("partyBmm", quote.partyBmm ? quote.partyBmm!.toString() : null)
				.build(),
		)
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
