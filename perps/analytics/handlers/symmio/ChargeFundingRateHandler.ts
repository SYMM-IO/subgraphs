import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../../common/handlers/symmio/ChargeFundingRateHandler"
import { Account, FundingHistory, Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { unDecimal } from "../../utils/common"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"

export class ChargeFundingRateHandler<T> extends CommonChargeFundingRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		// Capture pre-update state before common handler modifies Quote
		let prevPrices: Array<BigInt> = []
		let openAmounts: Array<BigInt> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (quote) {
				prevPrices.push(quote.openedPrice!)
				openAmounts.push(quote.quantity!.minus(quote.closedAmount!))
			} else {
				prevPrices.push(BigInt.zero())
				openAmounts.push(BigInt.zero())
			}
		}

		super.handleQuote(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			let rate = event.params.rates[i]
			let newPrice = quote.openedPrice!
			let prevPrice = prevPrices[i]
			let openAmount = openAmounts[i]
			let funding = unDecimal(newPrice.minus(prevPrice).abs().times(openAmount))

			let paid = rate.gt(BigInt.zero())
			let fundingPaid = BigInt.zero()
			let fundingReceived = BigInt.zero()
			if (paid) fundingPaid = funding
			else fundingReceived = funding

			let account = Account.load(quote.partyA.toHexString())
			if (!account) continue
			let solverAccount = Account.load(quote.partyB!.toHexString())

			updateHistories(
				new UpdateHistoriesParams(version, account, solverAccount, event)
					.symbolId(quote.symbolId!)
					.fundingPaid(fundingPaid)
					.fundingReceived(fundingReceived),
			)

			let fundingHistory = new FundingHistory(
				quoteId.toString() + "-" + event.address.toHexString() + "-" + event.block.timestamp.toString(),
			)
			fundingHistory.source = event.address
			fundingHistory.quoteId = quoteId
			fundingHistory.quote = quoteId.toString() + "-" + event.address.toHexString()
			fundingHistory.fundingType = "CHARGE_FUNDING_RATE"
			fundingHistory.rate = rate
			fundingHistory.fundingPaid = fundingPaid
			fundingHistory.fundingReceived = fundingReceived
			fundingHistory.prevPrice = prevPrice
			fundingHistory.newPrice = newPrice
			fundingHistory.openQuantity = openAmount
			fundingHistory.timestamp = event.block.timestamp
			fundingHistory.blockNumber = event.block.number
			fundingHistory.transaction = event.transaction.hash
			fundingHistory.save()
		}
	}
}
