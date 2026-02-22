import { BaseHandler, Version } from "../../BaseHandler"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { setEventTimestampAndTransactionHashAndAction } from "../../utils/quote"
import { Quote } from "../../../../generated/schema"
import { getQuoteData } from "../../VersionedQuoteLoader"

export class ChargeAccumulatedFundingFeeHandler<T> extends BaseHandler {
	handleQuote(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			let prevFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()

			let chainQuote = getQuoteData(version, event.address, quote.quoteId)
			if (!chainQuote) {
				setEventTimestampAndTransactionHashAndAction(quote, "ChargeAccumulatedFundingFee", _event)
				continue
			}

			let newFunding = chainQuote.accumulatedPaidFunding
			let delta = newFunding.minus(prevFunding)
			quote.accumulatedPaidFunding = newFunding

			if (delta.gt(BigInt.zero())) {
				quote.userPaidFunding = (quote.userPaidFunding ? quote.userPaidFunding! : BigInt.zero()).plus(delta)
			} else if (delta.lt(BigInt.zero())) {
				quote.userReceivedFunding = (quote.userReceivedFunding ? quote.userReceivedFunding! : BigInt.zero()).plus(delta.abs())
			}

			setEventTimestampAndTransactionHashAndAction(quote, "ChargeAccumulatedFundingFee", _event)
		}
	}
}
