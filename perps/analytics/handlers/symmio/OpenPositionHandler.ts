import { OpenPositionHandlerWithAccount as CommonOpenPositionHandler } from "../../../common/handlers/symmio/OpenPositionHandlerWithAccount"
import { Account, Quote, Symbol, TradeHistory } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { QuoteStatus } from "../../utils/constants"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { log } from "@graphprotocol/graph-ts"

export class OpenPositionHandler<T> extends CommonOpenPositionHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		let account = Account.load(event.params.partyA.toHexString())
		if (account == null){
			log.error("Account not found for partyA: {}", [event.params.partyA.toHexString()])
			return // Should never happen
		}
		let volume = unDecimal(event.params.filledAmount.times(event.params.openedPrice))
		let history = new TradeHistory(account.id + "-" + event.params.quoteId.toString())
		history.account = event.params.partyA
		history.timestamp = event.block.timestamp
		history.blockNumber = event.block.number
		history.transaction = event.transaction.hash
		history.volume = volume
		history.quoteStatus = QuoteStatus.OPENED
		history.quote = event.params.quoteId
		history.updateTimestamp = event.block.timestamp
		history.save()

		let quote = Quote.load(event.params.quoteId.toString())
		if (quote == null){	
			log.error("Quote not found for quoteId: {}", [event.params.quoteId.toString()])
			return // Should never happen
		}
		const symbol = Symbol.load(quote.symbolId!.toString())
		if (symbol == null){
			log.error("Symbol not found for quoteId: {}", [event.params.quoteId.toString()])
			return // Should never happen
		}

		let tradingFee = event.params.filledAmount.times(quote.openedPrice!).times(symbol.tradingFee).div(BigInt.fromString("10").pow(36))

		const partyB = event.params.partyB.toHexString()
		let solverAccount = Account.load(partyB)!

		updateHistories(
			new UpdateHistoriesParams(version, account, solverAccount, event)
				.openTradeVolume(volume)
				.symbolId(quote.symbolId!)
				.positionsCount(BigInt.fromI32(1))
				.tradingFee(tradingFee),
		)
		if (_event.block.timestamp > BigInt.fromI32(1723852800)) {
			// From this timestamp we count partyB volumes in analytics as well
			updateHistories(
				new UpdateHistoriesParams(version, solverAccount, null, event, account.accountSource).openTradeVolume(volume).symbolId(quote.symbolId!),
			)
		}
		updateDailyOpenInterest(event.block.timestamp, volume, true, solverAccount, account.accountSource)
	}
}
