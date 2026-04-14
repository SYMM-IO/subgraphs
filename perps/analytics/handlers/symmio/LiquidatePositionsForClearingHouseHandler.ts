
import { LiquidatePositionsForClearingHouseHandler as CommonLiquidatePositionsForClearingHouseHandler } from "../../../common/handlers/symmio/LiquidatePositionsForClearingHouseHandler"
import { Address, ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, Quote } from "../../../../generated/schema"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { getQuoteData } from "../../../common/VersionedQuoteLoader"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { onPositionClose } from "../../utils/aggregatedPosition"
import { syncFundingFeeState } from "../../utils/fundingFeeState"

export class LiquidatePositionsForClearingHouseHandler<T> extends CommonLiquidatePositionsForClearingHouseHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let qId = event.params.quoteIds[i]
			let quote = Quote.load(qId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			const chainQuote = getQuoteData(version, event.address, qId)
			if (chainQuote == null) continue
			let liquidAmount = quote.liquidateAmount!
			let liquidPrice = quote.liquidatePrice!
			const additionalVolume = liquidAmount.times(liquidPrice).div(BigInt.fromString("10").pow(18))

			onPositionClose(
				_event,
				version,
				changetype<Address>(quote.partyA),
				changetype<Address>(quote.partyB!),
				quote.symbolId!,
				quote.positionType,
				liquidAmount,
				quote.openedPrice!,
				quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero(),
				true,
			)
			syncFundingFeeState(_event, version, quote.symbolId!, changetype<Address>(quote.partyB!))

			createQuoteEvent(
				_event,
				qId,
				"LIQUIDATE_CLEARING_HOUSE",
				new JSONBuilder()
					.add("amount", liquidAmount.toString())
					.add("closePrice", liquidPrice.toString())
					.build(),
			)

			let account = Account.load(quote.partyA.toHexString())
			if (!account) continue
			let solverAccount = Account.load(quote.partyB!.toHexString())
			if (!solverAccount) continue

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
				updateHistories(
					new UpdateHistoriesParams(version, solverAccount, null, event, account.accountSource)
						.liquidateTradeVolume(additionalVolume)
						.symbolId(quote.symbolId!),
				)
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
		let seenPairs: Array<string> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let q = Quote.load(event.params.quoteIds[i].toString() + "-" + event.address.toHexString())
			if (!q || !q.partyB) continue
			let partyAHex = q.partyA.toHexString()
			let partyBHex = q.partyB!.toHexString()
			let pairKey = partyAHex + "-" + partyBHex
			if (seenPairs.includes(pairKey)) continue
			seenPairs.push(pairKey)
			updatePartyALatestBalance(_event, version, changetype<Address>(q.partyA))
			updatePartyBLatestBalance(_event, version, changetype<Address>(q.partyB!), changetype<Address>(q.partyA))
		}
	}
}
