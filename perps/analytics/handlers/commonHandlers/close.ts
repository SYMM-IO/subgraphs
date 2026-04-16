import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum"
import { Account, DebugEntity, Quote } from "../../../../generated/schema"
import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { Version } from "../../../common/BaseHandler"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { onPositionClose } from "../../utils/aggregatedPosition"
import { syncFundingFeeState } from "../../utils/fundingFeeState"

export function handleClose<T>(_event: ethereum.Event, name: string, version: Version, closeType: string): void {
	// @ts-ignore
	const event = changetype<T>(_event) // FillClose, ForceClose, EmergencyClose all have the same event signature
	let quote = Quote.load(event.params.quoteId.toString() + "-" + event.address.toHexString())
	if (!quote) {
		log.debug("quote not exist. quoteId {}", [event.params.quoteId.toString()])
		let db = new DebugEntity("handleClose-quote-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
		db.message = `quote not exist. quoteId ${event.params.quoteId.toString()}`
		db.save()
		return
	}
	const additionalVolume = event.params.filledAmount.times(event.params.closedPrice).div(BigInt.fromString("10").pow(18))

	onPositionClose(
		_event,
		version,
		changetype<Address>(quote.partyA),
		changetype<Address>(quote.partyB!),
		quote.symbolId!,
		quote.positionType,
		event.params.filledAmount,
		quote.openedPrice!,
		quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero(),
		quote.closedAmount!.equals(quote.quantity!),
	)
	if (version == Version.v_0_8_5) syncFundingFeeState(_event, version, quote.symbolId!, changetype<Address>(quote.partyB!))

	createQuoteEvent(
		_event,
		event.params.quoteId,
		closeType,
		new JSONBuilder()
			.add("amount", event.params.filledAmount.toString())
			.add("closePrice", event.params.closedPrice.toString())
			.add("quoteStatus", quote.quoteStatus.toString())
			.build(),
	)

	let account = Account.load(event.params.partyA.toHexString())
	if (!account) return
	let solverAccount = Account.load(quote.partyB!.toHexString())
	if (!solverAccount) return

	const pnl = unDecimal(
		(quote.positionType == 0 ? BigInt.fromString("1") : BigInt.fromString("1").neg())
			.times(event.params.closedPrice.minus(quote.openedPrice!))
			.times(event.params.filledAmount),
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
		// From this timestamp we count partyB volumes in analytics as well
		updateHistories(
			new UpdateHistoriesParams(version, solverAccount, null, event, account.accountSource)
				.closeTradeVolume(additionalVolume)
				.symbolId(quote.symbolId!),
		)
		// updateDailyOpenInterest(
		// 	event.block.timestamp,
		// 	unDecimal(event.params.filledAmount.times(quote.initialOpenedPrice!)),
		// 	false,
		// 	solverAccount,
		// 	account.accountSource,
		// 	event.address,
		// )
	}
	updateDailyOpenInterest(
		event.block.timestamp,
		unDecimal(event.params.filledAmount.times(quote.initialOpenedPrice!)),
		false,
		solverAccount,
		account.accountSource,
		event.address,
	)
}
