import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuote as getQuote_0_8_5 } from "../../../common/contract_utils_0_8_5"
import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { unDecimal } from "../../utils/common"

export class ChargeAccumulatedFundingFeeHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			let account = Account.load(quote.partyA.toHexString())
			if (!account) continue
			let solverAccount = Account.load(quote.partyB!.toHexString())

			const openAmount = quote.quantity!.minus(quote.closedAmount!)
			let chainQuote = getQuote_0_8_5(event.address, quote.quoteId)
			if (chainQuote == null) continue

			let funding = unDecimal(chainQuote.openedPrice.minus(quote.openedPrice!).abs().times(openAmount))
			let fundingPaid = funding
			let fundingReceived = BigInt.zero()

			updateHistories(
				new UpdateHistoriesParams(version, account, solverAccount, event)
					.symbolId(quote.symbolId!)
					.fundingPaid(fundingPaid)
					.fundingReceived(fundingReceived),
			)
		}
	}
}
