import { BigInt } from "@graphprotocol/graph-ts"
import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../common/handlers/ChargeFundingRateHandler"
import { Account, Quote, QuoteFundingDetails } from "../../generated/schema"
import { ChargeFundingRate } from "../../generated/symmio/symmio"
import { getQuote, setEventTimestampAndTransactionHashAndAction } from "../../common/helper"
import { getDailyHistoryForTimestamp, getDailySymbolTradesHistory, getTotalHistory, getTotalSymbolTradesHistory, unDecimal } from "../utils"

export class ChargeFundingRateHandler extends CommonChargeFundingRateHandler {

	constructor(event: ChargeFundingRate) {
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

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			const rate = event.params.rates[i]
			let quote = Quote.load(quoteId.toString())!
			let account = Account.load(quote.partyA.toHexString())!
			const openAmount = quote.quantity!.minus(quote.closedAmount!)
			const chainQuote = getQuote(BigInt.fromString(quote.id), event.address)!
			const paid = rate.gt(BigInt.zero())
			const funding = unDecimal((chainQuote.openedPrice.minus(quote.openedPrice!).abs()).times(openAmount))

			let quoteFundingDetails = QuoteFundingDetails.load(quoteId.toString())!
			if (paid)
				quoteFundingDetails.fundingPaid = quoteFundingDetails.fundingPaid.plus(funding)
			else
				quoteFundingDetails.fundingReceived = quoteFundingDetails.fundingReceived.plus(funding)
			quote.openedPrice = chainQuote.openedPrice
			quote.save()
			setEventTimestampAndTransactionHashAndAction(quote.id, event.block.timestamp, 'ChargeFundingRate', event.transaction.hash)

			const dh = getDailyHistoryForTimestamp(
				event.block.timestamp,
				event.params.partyA,
				account.accountSource,
			)

			if (paid)
				dh.fundingPaid = dh.fundingPaid.plus(funding)
			else dh.fundingReceived = dh.fundingReceived.plus(funding)
			dh.updateTimestamp = event.block.timestamp
			dh.save()

			const th = getTotalHistory(
				event.block.timestamp,
				event.params.partyA,
				account.accountSource,
			)
			if (paid)
				th.fundingPaid = th.fundingPaid.plus(funding)
			else th.fundingReceived = th.fundingReceived.plus(funding)
			th.updateTimestamp = event.block.timestamp
			th.save()

			const dailySymbolTradesHistory = getDailySymbolTradesHistory(
				event.block.timestamp,
				event.params.partyA,
				account.accountSource,
				quote.symbolId!,
			)
			if (paid)
				dailySymbolTradesHistory.fundingPaid = dailySymbolTradesHistory.fundingPaid.plus(funding)
			else dailySymbolTradesHistory.fundingReceived = dailySymbolTradesHistory.fundingReceived.plus(funding)
			dailySymbolTradesHistory.save()

			const totalSymbolTradesHistory = getTotalSymbolTradesHistory(
				event.block.timestamp,
				event.params.partyA,
				account.accountSource,
				quote.symbolId!,
			)
			if (paid)
				totalSymbolTradesHistory.fundingPaid = totalSymbolTradesHistory.fundingPaid.plus(funding)
			else totalSymbolTradesHistory.fundingReceived = totalSymbolTradesHistory.fundingReceived.plus(funding)
			totalSymbolTradesHistory.save()
		}
	}
}
