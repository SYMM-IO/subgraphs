import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, CloseHistory, Quote, TradeHistory } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../../common/VersionedQuoteLoader"
import { QuoteStatus } from "../../utils/constants"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"

export class LiquidatePositionsForClearingHouseHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		for (let i = 0; i < event.params.quoteIds.length; i++) {
			const qId = event.params.quoteIds[i]
			const quote = Quote.load(qId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			const chainQuote = getQuoteData(version, event.address, qId)
			if (chainQuote == null) continue

			const liquidAmount = quote.quantity!.minus(quote.closedAmount!)
			const liquidPrice = chainQuote.avgClosedPrice.times(quote.quantity!).minus(quote.averageClosedPrice!.times(quote.closedAmount!)).div(liquidAmount)
			const additionalVolume = liquidAmount.times(liquidPrice).div(BigInt.fromString("10").pow(18))

			let history = TradeHistory.load(event.params.subject.toHexString() + "-" + qId.toString())
			if (history) {
				history.volume = history.volume.plus(additionalVolume)
				history.quoteStatus = QuoteStatus.LIQUIDATED
				history.updateTimestamp = event.block.timestamp
				history.quote = qId
				history.save()
			}

			let closeHistory = new CloseHistory(
				event.params.subject.toHexString() + "-" + qId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
			)
			closeHistory.source = event.address
			closeHistory.account = event.params.subject
			closeHistory.amount = liquidAmount
			closeHistory.closePrice = liquidPrice
			closeHistory.volume = additionalVolume
			closeHistory.timestamp = event.block.timestamp
			closeHistory.blockNumber = event.block.number
			closeHistory.transaction = event.transaction.hash
			closeHistory.quoteStatus = QuoteStatus.LIQUIDATED
			closeHistory.quote = qId
			closeHistory.save()

			let account = Account.load(quote.partyA.toHexString())!
			let solverAccount = Account.load(quote.partyB!.toHexString())!

			const pnl = unDecimal(
				(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
					.times(liquidPrice.minus(quote.openedPrice!))
					.times(liquidAmount),
			)
			let profit = BigInt.zero()
			let loss = BigInt.zero()
			if (pnl.gt(BigInt.zero())) profit = pnl
			else loss = pnl

			updateHistories(
				new UpdateHistoriesParams(version, account, solverAccount, event)
					.liquidateTradeVolume(additionalVolume)
					.symbolId(quote.symbolId!)
					.loss(loss)
					.profit(profit),
			)
			updateDailyOpenInterest(
				event.block.timestamp,
				unDecimal(liquidAmount.times(quote.initialOpenedPrice!)),
				false,
				solverAccount,
				account.accountSource,
				event.address,
			)
		}
	}
}
