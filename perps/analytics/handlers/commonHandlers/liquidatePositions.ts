import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { Version } from "../../../common/BaseHandler"
import { BigInt } from "@graphprotocol/graph-ts"
import { Account, CloseHistory, Quote } from "../../../../generated/schema"
import { QuoteStatus } from "../../utils/constants"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"

export function handleLiquidatePosition<T>(_event: ethereum.Event, version: Version, qId: BigInt, closeType: string): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	const quote = Quote.load(qId.toString() + "-" + event.address.toHexString())
	if (!quote) return

	// Use pre-computed values from the common handler (which already updated closedAmount = quantity)
	if (!quote.liquidateAmount || !quote.liquidatePrice) return
	let liquidAmount = quote.liquidateAmount!
	let liquidPrice = quote.liquidatePrice!
	const additionalVolume = liquidAmount.times(liquidPrice).div(BigInt.fromString("10").pow(18))

	let closeHistory = new CloseHistory(
		event.params.partyA.toHexString() + "-" + qId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
	)
	closeHistory.source = event.address
	closeHistory.account = event.params.partyA
	closeHistory.amount = liquidAmount
	closeHistory.closePrice = liquidPrice
	closeHistory.volume = additionalVolume
	closeHistory.closeType = closeType
	closeHistory.timestamp = event.block.timestamp
	closeHistory.blockNumber = event.block.number
	closeHistory.transaction = event.transaction.hash
	closeHistory.quoteStatus = QuoteStatus.LIQUIDATED
	closeHistory.quoteId = qId
	closeHistory.quote = qId.toString() + "-" + event.address.toHexString()
	closeHistory.save()

	let account = Account.load(quote.partyA.toHexString())
	if (!account) return
	let solverAccount = Account.load(quote.partyB!.toHexString())
	if (!solverAccount) return

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
