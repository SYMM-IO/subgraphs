
import { ADLCloseHandler as CommonADLCloseHandler } from "../../../common/handlers/symmio/ADLCloseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt, log } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, CloseHistory, DebugEntity, Quote, TradeHistory } from "../../../../generated/schema"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"

export class ADLCloseHandler<T> extends CommonADLCloseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) {
			log.debug("quote not exist. quoteId {}", [event.params.quoteId.toString()])
			let db = new DebugEntity("ADLClose-quote-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quote not exist. quoteId ${event.params.quoteId.toString()}`
			db.save()
			return
		}

		const additionalVolume = event.params.amount.times(event.params.price).div(BigInt.fromString("10").pow(18))

		let history = TradeHistory.load(quote.partyA.toHexString() + "-" + event.params.quoteId.toString())
		if (!history) {
			let db = new DebugEntity("ADLClose-history-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `history not exist. quoteId ${event.params.quoteId.toString()}`
			db.save()
			return
		}
		history.volume = history.volume.plus(additionalVolume)
		history.updateTimestamp = event.block.timestamp
		history.quoteStatus = quote.quoteStatus
		history.quote = event.params.quoteId
		history.save()

		let closeHistory = new CloseHistory(
			quote.partyA.toHexString() +
				"-" +
				event.params.quoteId.toString() +
				"-" +
				event.address.toHexString() +
				"-" +
				event.block.timestamp.toString(),
		)
		closeHistory.source = event.address
		closeHistory.account = quote.partyA
		closeHistory.amount = event.params.amount
		closeHistory.closePrice = event.params.price
		closeHistory.volume = additionalVolume
		closeHistory.closeType = "ADL_CLOSE"
		closeHistory.timestamp = event.block.timestamp
		closeHistory.blockNumber = event.block.number
		closeHistory.transaction = event.transaction.hash
		closeHistory.quoteStatus = quote.quoteStatus
		closeHistory.quoteId = event.params.quoteId
		closeHistory.quote = event.params.quoteId.toString() + "-" + event.address.toHexString()
		closeHistory.save()

		let account = Account.load(quote.partyA.toHexString())
		if (!account) return
		let solverAccount = Account.load(quote.partyB!.toHexString())
		if (!solverAccount) return

		const pnl = unDecimal(
			(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
				.times(event.params.price.minus(quote.openedPrice!))
				.times(event.params.amount),
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
			unDecimal(event.params.amount.times(quote.initialOpenedPrice!)),
			false,
			solverAccount,
			account.accountSource,
			event.address,
		)
	}
}
