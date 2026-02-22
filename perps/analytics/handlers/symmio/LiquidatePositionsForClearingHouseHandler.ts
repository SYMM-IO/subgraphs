
import { LiquidatePositionsForClearingHouseHandler as CommonLiquidatePositionsForClearingHouseHandler } from "../../../common/handlers/symmio/LiquidatePositionsForClearingHouseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, CloseHistory, Quote } from "../../../../generated/schema"
import { QuoteStatus } from "../../utils/constants"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { updateDailyOpenInterest } from "../../utils/openInterestHelpers"
import { unDecimal } from "../../utils/common"
import { getQuoteData } from "../../../common/VersionedQuoteLoader"

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

			let closeHistory = new CloseHistory(
				quote.partyA.toHexString() + "-" + qId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
			)
			closeHistory.source = event.address
			closeHistory.account = quote.partyA
			closeHistory.amount = liquidAmount
			closeHistory.closePrice = liquidPrice
			closeHistory.volume = additionalVolume
			closeHistory.closeType = "LIQUIDATE_CLEARING_HOUSE"
			closeHistory.timestamp = event.block.timestamp
			closeHistory.blockNumber = event.block.number
			closeHistory.transaction = event.transaction.hash
			closeHistory.quoteStatus = QuoteStatus.LIQUIDATED
			closeHistory.quoteId = qId
			closeHistory.quote = qId.toString() + "-" + event.address.toHexString()
			closeHistory.save()

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
	}
}
