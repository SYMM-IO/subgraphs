import { BaseHandler, Version } from "../../../common/BaseHandler"
import { Account, Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { getQuoteData } from "../../../common/VersionedQuoteLoader"
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
			let chainQuote = getQuoteData(version, event.address, quote.quoteId)
			if (chainQuote == null) continue

			let priceDiff = chainQuote.openedPrice.minus(quote.openedPrice!)
			let funding = unDecimal(priceDiff.abs().times(openAmount))
			// Determine direction from price change (no rates param on this event)
			const paid = priceDiff.gt(BigInt.zero())
			let fundingPaid = BigInt.zero()
			let fundingReceived = BigInt.zero()
			if (paid) fundingPaid = funding
			else fundingReceived = funding

			quote.openedPrice = chainQuote.openedPrice
			quote.userPaidFunding = quote.userPaidFunding!.plus(fundingPaid)
			quote.userReceivedFunding = quote.userReceivedFunding!.plus(fundingReceived)
			quote.save()

			updateHistories(
				new UpdateHistoriesParams(version, account, solverAccount, event)
					.symbolId(quote.symbolId!)
					.fundingPaid(fundingPaid)
					.fundingReceived(fundingReceived),
			)
		}
	}
}
