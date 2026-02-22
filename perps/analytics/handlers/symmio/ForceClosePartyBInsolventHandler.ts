
import { ForceClosePartyBInsolventHandler as CommonForceClosePartyBInsolventHandler } from "../../../common/handlers/symmio/ForceClosePartyBInsolventHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt, log } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, CloseHistory, DebugEntity, Quote } from "../../../../generated/schema"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"

export class ForceClosePartyBInsolventHandler<T> extends CommonForceClosePartyBInsolventHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		// Load quote BEFORE common handler updates it, to get the pre-update closedAmount
		let quotePre = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quotePre) {
			log.debug("quote not exist. quoteId {}", [event.params.quoteId.toString()])
			let db = new DebugEntity("ForceCloseInsolvent-quote-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
			db.message = `quote not exist. quoteId ${event.params.quoteId.toString()}`
			db.save()
			return
		}
		let fillAmount = quotePre.quantity!.minus(quotePre.closedAmount!)

		super.handle(_event, version)

		let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
		if (!quote) return

		const additionalVolume = fillAmount.times(event.params.closedPrice).div(BigInt.fromString("10").pow(18))

		let closeHistory = new CloseHistory(
			event.params.partyA.toHexString() +
				"-" +
				event.params.quoteId.toString() +
				"-" +
				event.address.toHexString() +
				"-" +
				event.block.timestamp.toString(),
		)
		closeHistory.source = event.address
		closeHistory.account = event.params.partyA
		closeHistory.amount = fillAmount
		closeHistory.closePrice = event.params.closedPrice
		closeHistory.volume = additionalVolume
		closeHistory.closeType = "FORCE_CLOSE_INSOLVENT"
		closeHistory.timestamp = event.block.timestamp
		closeHistory.blockNumber = event.block.number
		closeHistory.transaction = event.transaction.hash
		closeHistory.quoteStatus = quote.quoteStatus
		closeHistory.quoteId = event.params.quoteId
		closeHistory.quote = event.params.quoteId.toString() + "-" + event.address.toHexString()
		closeHistory.save()

		let account = Account.load(event.params.partyA.toHexString())
		if (!account) return
		let solverAccount = Account.load(quote.partyB!.toHexString())
		if (!solverAccount) return

		const pnl = unDecimal(
			(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
				.times(event.params.closedPrice.minus(quote.openedPrice!))
				.times(fillAmount),
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
			unDecimal(fillAmount.times(quote.initialOpenedPrice!)),
			false,
			solverAccount,
			account.accountSource,
			event.address,
		)
	}
}
