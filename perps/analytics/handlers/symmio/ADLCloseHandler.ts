
import { ADLCloseHandler as CommonADLCloseHandler } from "../../../common/handlers/symmio/ADLCloseHandler"
import { Address, ethereum } from "@graphprotocol/graph-ts"
import { BigInt, log } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, DebugEntity, Quote } from "../../../../generated/schema"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { onPositionClose } from "../../utils/aggregatedPosition"
import { syncFundingFeeState } from "../../utils/fundingFeeState"

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

		onPositionClose(
			_event,
			changetype<Address>(quote.partyA),
			changetype<Address>(quote.partyB!),
			quote.symbolId!,
			quote.positionType,
			event.params.amount,
			quote.openedPrice!,
			quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero(),
			quote.closedAmount!.equals(quote.quantity!),
		)
		syncFundingFeeState(_event, quote.symbolId!, changetype<Address>(quote.partyB!))

		createQuoteEvent(
			_event,
			event.params.quoteId,
			"ADL_CLOSE",
			new JSONBuilder()
				.add("amount", event.params.amount.toString())
				.add("closePrice", event.params.price.toString())
				.build(),
		)
		updatePartyALatestBalance(_event, version, changetype<Address>(quote.partyA))
		if (quote.partyB) updatePartyBLatestBalance(_event, version, changetype<Address>(quote.partyB!), changetype<Address>(quote.partyA))

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
