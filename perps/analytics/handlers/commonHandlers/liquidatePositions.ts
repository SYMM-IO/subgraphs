import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { Version } from "../../../common/BaseHandler"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Account, Quote } from "../../../../generated/schema"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { onPositionClose } from "../../utils/aggregatedPosition"

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

	onPositionClose(
		_event,
		changetype<Address>(quote.partyA),
		changetype<Address>(quote.partyB!),
		quote.symbolId!,
		quote.positionType,
		liquidAmount,
		quote.openedPrice!,
		quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero(),
		true,
	)

	createQuoteEvent(
		_event,
		qId,
		closeType,
		new JSONBuilder()
			.add("amount", liquidAmount.toString())
			.add("closePrice", liquidPrice.toString())
			.build(),
	)

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
