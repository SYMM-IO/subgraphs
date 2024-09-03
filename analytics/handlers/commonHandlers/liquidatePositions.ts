import {ethereum} from "@graphprotocol/graph-ts/chain/ethereum";
import {Version} from "../../../common/BaseHandler";
import {BigInt} from "@graphprotocol/graph-ts";
import {Account, Quote, TradeHistory} from "../../../generated/schema";
import {getQuote as getQuote_0_8_2} from "../../../common/contract_utils_0_8_2";
import {getQuote as getQuote_0_8_3} from "../../../common/contract_utils_0_8_3";
import {getQuote as getQuote_0_8_0} from "../../../common/contract_utils_0_8_0";
import {QuoteStatus} from "../../utils/constants";
import {unDecimal, updateDailyOpenInterest, updateHistories, UpdateHistoriesParams} from "../../utils/helpers";
import {USER_PROFILE} from "../../config";

export function handleLiquidatePosition<T>(_event: ethereum.Event, version: Version, qId: BigInt): void {
	// @ts-ignore
	const event = changetype<T>(_event)
	const quote = Quote.load(qId.toString())!

	let liquidAmount: BigInt;
	let liquidPrice: BigInt;
	switch (version) {
		case Version.v_0_8_3: {
			const chainQuote = getQuote_0_8_3(event.address, qId)
			if (chainQuote == null) return
			liquidAmount = quote.quantity!.minus(quote.closedAmount!)
			liquidPrice = chainQuote.avgClosedPrice.times(quote.quantity!).minus(quote.averageClosedPrice!.times(quote.closedAmount!)).div(liquidAmount)
			break
		}
		case Version.v_0_8_2: {
			const chainQuote = getQuote_0_8_2(event.address, qId)
			if (chainQuote == null) return
			liquidAmount = quote.quantity!.minus(quote.closedAmount!)
			liquidPrice = chainQuote.avgClosedPrice.times(quote.quantity!).minus(quote.averageClosedPrice!.times(quote.closedAmount!)).div(liquidAmount)
			break
		}
		case Version.v_0_8_0: {
			const chainQuote = getQuote_0_8_0(event.address, qId)
			if (chainQuote == null) return
			liquidAmount = quote.quantity!.minus(quote.closedAmount!)
			liquidPrice = chainQuote.avgClosedPrice.times(quote.quantity!).minus(quote.averageClosedPrice!.times(quote.closedAmount!)).div(liquidAmount)
			break
		}
	}
	const additionalVolume = liquidAmount.times(liquidPrice).div(BigInt.fromString("10").pow(18))

	if (!USER_PROFILE) {
		let history = TradeHistory.load(event.params.partyA.toHexString() + "-" + qId.toString())!
		history.volume = history.volume.plus(additionalVolume)
		history.quoteStatus = QuoteStatus.LIQUIDATED
		history.updateTimestamp = event.block.timestamp
		history.quote = qId
		history.save()
	}
	let account = Account.load(quote.partyA.toHexString())!

	updateHistories(
		new UpdateHistoriesParams(account, event.block.timestamp)
			.closeTradeVolume(additionalVolume)
			.symbolId(quote.symbolId!)
	)
	if (_event.block.timestamp > BigInt.fromI32(1723852800)) { // From this timestamp we count partyB volumes in analytics as well
		updateHistories(
			new UpdateHistoriesParams(Account.load(quote.partyB!.toHexString())!, event.block.timestamp, account.accountSource)
				.closeTradeVolume(additionalVolume)
				.symbolId(quote.symbolId!)
		)
	}
	updateDailyOpenInterest(event.block.timestamp, unDecimal(liquidAmount.times(quote.openedPrice!)), false, account.accountSource)
}