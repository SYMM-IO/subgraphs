import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, CloseHistory, Quote, TradeHistory } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { QuoteStatus } from "../../utils/constants"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"

export class ForceClosePartyBInsolventHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		const quoteId = event.params.quoteId
		let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return

		const closedAmount = quote.quantity!.minus(quote.closedAmount!)
		const closePrice = event.params.closedPrice
		const additionalVolume = closedAmount.times(closePrice).div(BigInt.fromString("10").pow(18))

		let history = TradeHistory.load(event.params.partyA.toHexString() + "-" + quoteId.toString())
		if (history) {
			history.volume = history.volume.plus(additionalVolume)
			history.updateTimestamp = event.block.timestamp
			history.quoteStatus = QuoteStatus.CLOSED
			history.quote = quoteId
			history.save()
		}

		let closeHistory = new CloseHistory(
			event.params.partyA.toHexString() +
				"-" +
				quoteId.toString() +
				"-" +
				event.address.toHexString() +
				"-" +
				event.block.timestamp.toString(),
		)
		closeHistory.source = event.address
		closeHistory.account = event.params.partyA
		closeHistory.amount = closedAmount
		closeHistory.closePrice = closePrice
		closeHistory.volume = additionalVolume
		closeHistory.timestamp = event.block.timestamp
		closeHistory.blockNumber = event.block.number
		closeHistory.transaction = event.transaction.hash
		closeHistory.quoteStatus = QuoteStatus.CLOSED
		closeHistory.quote = quoteId
		closeHistory.save()

		let account = Account.load(event.params.partyA.toHexString())!
		let solverAccount = Account.load(quote.partyB!.toHexString())!

		const pnl = unDecimal(
			(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
				.times(closePrice.minus(quote.openedPrice!))
				.times(closedAmount),
		)
		let profit = BigInt.zero()
		let loss = BigInt.zero()
		if (pnl.gt(BigInt.zero())) profit = pnl
		else loss = pnl

		updateHistories(
			new UpdateHistoriesParams(version, account, solverAccount, event)
				.closeTradeVolume(additionalVolume)
				.symbolId(quote.symbolId!)
				.loss(loss)
				.profit(profit),
		)
		if (_event.block.timestamp > BigInt.fromI32(1723852800)) {
			updateHistories(
				new UpdateHistoriesParams(version, solverAccount, null, event, account.accountSource)
					.closeTradeVolume(additionalVolume)
					.symbolId(quote.symbolId!),
			)
		}
		updateDailyOpenInterest(
			event.block.timestamp,
			unDecimal(closedAmount.times(quote.initialOpenedPrice!)),
			false,
			solverAccount,
			account.accountSource,
			event.address,
		)
	}
}
