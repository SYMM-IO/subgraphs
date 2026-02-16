import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { Version } from "../../../common/BaseHandler"
import { BigInt } from "@graphprotocol/graph-ts"
import { Account, CloseHistory, Quote, TradeHistory } from "../../../../generated/schema"
import { getQuoteData } from "../../../common/VersionedQuoteLoader"
import { QuoteStatus } from "../../utils/constants"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"

export function handleLiquidatePosition<T>(_event: ethereum.Event, version: Version, qId: BigInt): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	const quote = Quote.load(qId.toString() + "-" + event.address.toHexString())!

	const chainQuote = getQuoteData(version, event.address, qId)
	if (chainQuote == null) return
	let liquidAmount = quote.quantity!.minus(quote.closedAmount!)
	let liquidPrice = chainQuote.avgClosedPrice.times(quote.quantity!).minus(quote.averageClosedPrice!.times(quote.closedAmount!)).div(liquidAmount)
	const additionalVolume = liquidAmount.times(liquidPrice).div(BigInt.fromString("10").pow(18))

	let history = TradeHistory.load(event.params.partyA.toHexString() + "-" + qId.toString())!
	history.volume = history.volume.plus(additionalVolume)
	history.quoteStatus = QuoteStatus.LIQUIDATED
	history.updateTimestamp = event.block.timestamp
	history.quote = qId
	history.save()

	let closeHistory = new CloseHistory(
		event.params.partyA.toHexString() + "-" + qId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
	)
	closeHistory.source = event.address
	closeHistory.account = event.params.partyA
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
	if (_event.block.timestamp > BigInt.fromI32(1723852800)) {
		// From this timestamp we count partyB volumes in analytics as well
		updateHistories(
			new UpdateHistoriesParams(version, solverAccount, null, event, account.accountSource)
				.liquidateTradeVolume(additionalVolume)
				.symbolId(quote.symbolId!),
		)
		// updateDailyOpenInterest(
		// 	event.block.timestamp,
		// 	unDecimal(liquidAmount.times(quote.initialOpenedPrice!)),
		// 	false,
		// 	solverAccount,
		// 	account.accountSource,
		// 	event.address,
		// )
	}
	updateDailyOpenInterest(
		event.block.timestamp,
		unDecimal(liquidAmount.times(quote.initialOpenedPrice!)),
		false,
		solverAccount,
		account.accountSource,
		event.address,
	)
}
