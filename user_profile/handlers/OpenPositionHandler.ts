import { BigInt } from "@graphprotocol/graph-ts"
import { OpenPositionHandler as CommonOpenPositionHandler } from "../../common/handlers/OpenPositionHandler"
import { Account, Quote, Symbol } from "../../generated/schema"
import { OpenPosition } from "../../generated/symmio/symmio"
import { setEventTimestampAndTransactionHashAndAction } from "../../common/utils/quote&analitics&user"
import { QuoteStatus, getDailyHistoryForTimestamp, getDailySymbolTradesHistory, getTotalHistory, getTotalSymbolTradesHistory, unDecimal } from "../utils"
import { getQuote } from "../../common/utils"

export class OpenPositionHandler extends CommonOpenPositionHandler {

	constructor(event: OpenPosition) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()
		let event = super.getEvent()

		let account = Account.load(event.params.partyA.toHexString())!
		account.positionsCount = account.positionsCount.plus(BigInt.fromString("1"))
		account.updateTimestamp = event.block.timestamp
		account.save()

		let quote = Quote.load(event.params.quoteId.toString())!
		const chainQuote = getQuote(event.params.quoteId, event.address)
		quote.openedPrice = event.params.openedPrice
		quote.cva = chainQuote.lockedValues.cva
		quote.lf = chainQuote.lockedValues.lf
		quote.partyAmm = chainQuote.lockedValues.partyAmm
		quote.partyBmm = chainQuote.lockedValues.partyBmm
		quote.quantity = event.params.filledAmount
		quote.quoteStatus = QuoteStatus.OPENED
		quote.save()
		setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, "OpenPosition", event.transaction.hash, event.block.number)


		const symbol = Symbol.load(quote.symbolId!.toString())

		if (symbol == null) return

		const tradingFee = event.params.filledAmount
			.times(quote.openedPrice!)
			.times(symbol.tradingFee)
			.div(BigInt.fromString("10").pow(36))

		const volume = unDecimal(
			event.params.filledAmount.times(event.params.openedPrice),
		)

		const dh = getDailyHistoryForTimestamp(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
		)
		dh.openTradeVolume = dh.openTradeVolume.plus(volume)
		dh.platformFeePaid = dh.platformFeePaid.plus(tradingFee)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
		)
		th.openTradeVolume = th.openTradeVolume.plus(volume)
		th.platformFeePaid = th.platformFeePaid.plus(tradingFee)
		th.updateTimestamp = event.block.timestamp
		th.save()

		const dailySymbolTradesHistory = getDailySymbolTradesHistory(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
			quote.symbolId!,
		)
		dailySymbolTradesHistory.totalTrades = dailySymbolTradesHistory.totalTrades.plus(BigInt.fromString("1"))
		dailySymbolTradesHistory.platformFeePaid = dailySymbolTradesHistory.platformFeePaid.plus(tradingFee)
		dailySymbolTradesHistory.updateTimestamp = event.block.timestamp
		dailySymbolTradesHistory.save()

		const totalSymbolTradesHistory = getTotalSymbolTradesHistory(
			event.block.timestamp,
			event.params.partyA,
			account.accountSource,
			quote.symbolId!,
		)
		totalSymbolTradesHistory.totalTrades = totalSymbolTradesHistory.totalTrades.plus(BigInt.fromString("1"))
		totalSymbolTradesHistory.platformFeePaid = totalSymbolTradesHistory.platformFeePaid.plus(tradingFee)
		totalSymbolTradesHistory.updateTimestamp = event.block.timestamp
		totalSymbolTradesHistory.save()
	}
}
