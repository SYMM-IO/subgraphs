import { ChargeFundingRateHandler as CommonChargeFundingRateHandler } from "../../../common/handlers/symmio/ChargeFundingRateHandler"
import { Account, Quote } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { unDecimal } from "../../utils/common"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { onPriceUpdate } from "../../utils/aggregatedPosition"

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

			onPriceUpdate(
				_event,
				version,
				event.params.partyA,
				event.params.partyB,
				quote.symbolId!,
				quote.positionType,
				openAmount,
				prevPrice,
				newPrice,
			)

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

			createQuoteEvent(
				_event,
				quoteId,
				"CHARGE_FUNDING_RATE",
				new JSONBuilder()
					.add("rate", rate.toString())
					.add("fundingPaid", fundingPaid.toString())
					.add("fundingReceived", fundingReceived.toString())
					.add("prevPrice", prevPrice.toString())
					.add("newPrice", newPrice.toString())
					.add("openQuantity", openAmount.toString())
					.build(),
			)
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
