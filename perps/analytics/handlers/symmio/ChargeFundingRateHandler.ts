import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../../common/handlers/symmio/ChargeFundingRateHandler"
import { Account, Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../../common/VersionedQuoteLoader"
import { Version } from "../../../common/BaseHandler"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { unDecimal } from "../../utils/common"

export class ChargeFundingRateHandler<T> extends CommonChargeFundingRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			const rate = event.params.rates[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())!
			let account = Account.load(quote.partyA.toHexString())!
			let solverAccount = Account.load(quote.partyB!.toHexString())
			const openAmount = quote.quantity!.minus(quote.closedAmount!)
			let chainQuote = getQuoteData(version, event.address, quote.quoteId)!
			let funding = unDecimal(chainQuote.openedPrice.minus(quote.openedPrice!).abs().times(openAmount))
			const paid = rate.gt(BigInt.zero())
			let fundingPaid = BigInt.zero()
			let fundingReceived = BigInt.zero()
			if (paid) fundingPaid = funding
			else fundingReceived = funding

			updateHistories(
				new UpdateHistoriesParams(version, account, solverAccount, event)
					.symbolId(quote.symbolId!)
					.fundingPaid(fundingPaid)
					.fundingReceived(fundingReceived),
			)
		}
		super.handleQuote(_event, version)
	}
}
