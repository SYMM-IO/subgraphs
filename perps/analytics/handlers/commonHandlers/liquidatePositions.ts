import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { Version } from "../../../common/BaseHandler"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Account, DebugEntity, Quote } from "../../../../generated/schema"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { onFundingSettlementAndPositionClose } from "../../utils/aggregatedPosition"
import { syncFundingFeeState } from "../../utils/fundingFeeState"
import { FundingSettlementContext, getQuoteFundingSignedAmount, recordQuoteFundingSettlement } from "../../utils/fundingHistory"

export function handleLiquidatePosition<T>(
	_event: ethereum.Event,
	version: Version,
	qId: BigInt,
	closeType: string,
	fundingContext: FundingSettlementContext | null,
	fundingSignedAmountOverride: BigInt | null,
): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	const quote = Quote.load(qId.toString() + "-" + event.address.toHexString())
	if (!quote) return

	// Use pre-computed values from the common handler (which already updated closedAmount = quantity)
	if (!quote.liquidateAmount || !quote.liquidatePrice) return
	if (quote.partyB === null || quote.symbolId === null || quote.openedPrice === null || quote.initialOpenedPrice === null) {
		let db = new DebugEntity("handleLiquidatePosition-nullFields-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
		db.message =
			`quoteId ${qId.toString()} has null fields — partyB=` +
			(quote.partyB === null ? "null" : "set") +
			", symbolId=" +
			(quote.symbolId === null ? "null" : "set") +
			", openedPrice=" +
			(quote.openedPrice === null ? "null" : "set") +
			", initialOpenedPrice=" +
			(quote.initialOpenedPrice === null ? "null" : "set")
		db.save()
		return
	}
	let liquidAmount = quote.liquidateAmount!
	let liquidPrice = quote.liquidatePrice!
	const additionalVolume = liquidAmount.times(liquidPrice).div(BigInt.fromString("10").pow(18))

	let newFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
	let previousFunding = newFunding
	let preCloseOpenAmount = liquidAmount
	if (fundingContext !== null && fundingContext.found) {
		previousFunding = fundingContext.previousAccumulatedPaidFunding
		preCloseOpenAmount = fundingContext.openAmount
	}
	onFundingSettlementAndPositionClose(
		_event,
		version,
		changetype<Address>(quote.partyA),
		changetype<Address>(quote.partyB!),
		quote.symbolId!,
		quote.positionType,
		preCloseOpenAmount,
		liquidAmount,
		quote.openedPrice!,
		previousFunding,
		newFunding,
		true,
	)
	if (fundingContext !== null && fundingSignedAmountOverride === null) {
		recordQuoteFundingSettlement(_event, version, qId, closeType, fundingContext, true)
	}
	if (version >= Version.v_0_8_5) syncFundingFeeState(_event, version, quote.symbolId!, changetype<Address>(quote.partyB!))

	createQuoteEvent(
		_event,
		qId,
		closeType,
		new JSONBuilder()
			.add("amount", liquidAmount.toString())
			.add("openedPrice", quote.openedPrice!.toString())
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

	let fundingPaid = BigInt.zero()
	let fundingReceived = BigInt.zero()
	let fundingSignedAmount = fundingSignedAmountOverride === null ? getQuoteFundingSignedAmount(quote, fundingContext) : fundingSignedAmountOverride
	if (fundingSignedAmount.gt(BigInt.zero())) fundingPaid = fundingSignedAmount
	else if (fundingSignedAmount.lt(BigInt.zero())) fundingReceived = fundingSignedAmount.abs()

	updateHistories(
		new UpdateHistoriesParams(version, account, solverAccount, event)
			.liquidateTradeVolume(additionalVolume)
			.symbolId(quote.symbolId!)
			.loss(loss)
			.profit(profit)
			.fundingPaid(fundingPaid)
			.fundingReceived(fundingReceived),
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
