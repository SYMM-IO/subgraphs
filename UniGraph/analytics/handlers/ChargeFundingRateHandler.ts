import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../common/handlers/ChargeFundingRateHandler"
import { ChargeFundingRate } from "../../generated/symmio/symmio"
import { Account, Quote } from "../../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { getDailyHistoryForTimestamp, getTotalHistory, unDecimal } from "./utils"
import { getQuote } from "../contract_utils"

export class ChargeFundingRateHandler extends CommonChargeFundingRateHandler {

	constructor(event: ChargeFundingRate) {
		super(event)
	}

	handle(): void {
		super.handle()
		super.handleGlobalCounter()
		super.handleQuote()
		super.handleSymbol()
		super.handleUser()
		super.handleAccount()

		const event = this.getEvent()
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			const rate = event.params.rates[i]
			let quote = Quote.load(quoteId.toString())!
			let account = Account.load(quote.partyA.toHexString())!
			const openAmount = quote.quantity!.minus(quote.closedAmount!)
			const chainQuote = getQuote(event.address, BigInt.fromString(quote.id))!
			const funding = unDecimal((chainQuote.openedPrice.minus(quote.openedPrice!).abs()).times(openAmount))

			const dh = getDailyHistoryForTimestamp(event.block.timestamp, account.accountSource)
			if (funding.gt(BigInt.zero()))
				dh.fundingPaid = dh.fundingPaid.plus(funding)
			else
				dh.fundingReceived = dh.fundingReceived.plus(funding)
			dh.updateTimestamp = event.block.timestamp
			dh.save()

			const th = getTotalHistory(event.block.timestamp, account.accountSource)
			if (funding.gt(BigInt.zero()))
				th.fundingPaid = th.fundingPaid.plus(funding)
			else
				th.fundingReceived = th.fundingReceived.plus(funding)
			th.updateTimestamp = event.block.timestamp
			th.save()
		}
	}
}
