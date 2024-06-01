import { OpenPositionHandler as CommonOpenPositionHandler } from "../../common/handlers/OpenPositionHandler"
import { OpenPosition } from "../../generated/symmio/symmio"
import { Account, PriceCheck, Quote, Symbol, TradeHistory } from "../../generated/schema"
import { getDailyHistoryForTimestamp, getSymbolTradeVolume, getTotalHistory, QuoteStatus, unDecimal, updateDailyOpenInterest } from "../utils"
import { BigInt } from "@graphprotocol/graph-ts"

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

		const event = this.getEvent()
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
		let priceCheck = new PriceCheck(event.transaction.hash.toHexString() + event.transactionLogIndex.toString())
		priceCheck.event = "OpenPosition"
		priceCheck.symbol = symbol.name
		priceCheck.givenPrice = event.params.openedPrice
		priceCheck.timestamp = event.block.timestamp
		priceCheck.transaction = event.transaction.hash
		priceCheck.additionalInfo = quote.id
		priceCheck.save()

		let tradingFee = event.params.filledAmount
			.times(quote.openedPrice!)
			.times(symbol.tradingFee)
			.div(BigInt.fromString("10").pow(36))

		const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
		dh.tradeVolume = dh.tradeVolume.plus(history.volume)
		dh.openTradeVolume = dh.openTradeVolume.plus(history.volume)
		dh.platformFee = dh.platformFee.plus(tradingFee)
		dh.updateTimestamp = event.block.timestamp
		dh.save()

		const th = getTotalHistory(event.block.timestamp, account.accountSource)
		th.tradeVolume = th.tradeVolume.plus(history.volume)
		th.openTradeVolume = th.openTradeVolume.plus(history.volume)
		th.platformFee = th.platformFee.plus(tradingFee)
		th.updateTimestamp = event.block.timestamp
		th.save()

		let stv = getSymbolTradeVolume(quote.symbolId!, event.block.timestamp, account.accountSource)
		stv.volume = stv.volume.plus(history.volume)
		stv.updateTimestamp = event.block.timestamp
		stv.save()

		updateDailyOpenInterest(event.block.timestamp, history.volume, true, account.accountSource)
	}
}
