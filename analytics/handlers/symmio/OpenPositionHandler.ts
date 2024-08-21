import {
	OpenPositionHandlerWithAccount as CommonOpenPositionHandler
} from "../../../common/handlers/symmio/OpenPositionHandlerWithAccount"
import {Account, Quote, Symbol, TradeHistory} from "../../../generated/schema"
import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {Version} from "../../../common/BaseHandler";
import {QuoteStatus} from "../../utils/constants";

import {unDecimal, updateDailyOpenInterest, updateHistories, UpdateHistoriesParams} from "../../utils/helpers";

export class OpenPositionHandler<T> extends CommonOpenPositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.partyA.toHexString())!

		let history = new TradeHistory(
			account.id + "-" + event.params.quoteId.toString(),
		)
		history.account = event.params.partyA
		history.timestamp = event.block.timestamp
		history.blockNumber = event.block.number
		history.transaction = event.transaction.hash
		history.volume = unDecimal(
			event.params.filledAmount.times(event.params.openedPrice),
		)
		history.quoteStatus = QuoteStatus.OPENED
		history.quote = event.params.quoteId
		history.updateTimestamp = event.block.timestamp
		history.save()

		let quote = Quote.load(event.params.quoteId.toString())!
		const symbol = Symbol.load(quote.symbolId!.toString())!

		let tradingFee = event.params.filledAmount
			.times(quote.openedPrice!)
			.times(symbol.tradingFee)
			.div(BigInt.fromString("10").pow(36))

		updateHistories(
			new UpdateHistoriesParams(account, event.block.timestamp)
				.openTradeVolume(history.volume)
				.symbolId(quote.symbolId!)
				.tradingFee(tradingFee)
		)
		if (_event.block.timestamp > BigInt.fromI32(1723852800)) { // From this timestamp we count partyB volumes in analytics as well
			updateHistories(
				new UpdateHistoriesParams(Account.load(quote.partyB!.toHexString())!, event.block.timestamp, account.accountSource)
					.openTradeVolume(history.volume)
					.symbolId(quote.symbolId!)
			)
		}
		updateDailyOpenInterest(event.block.timestamp, history.volume, true, account.accountSource)
	}
}
