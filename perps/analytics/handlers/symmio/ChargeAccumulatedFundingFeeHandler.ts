import { ChargeAccumulatedFundingFeeHandler as CommonChargeAccumulatedFundingFeeHandler } from "../../../common/handlers/symmio/ChargeAccumulatedFundingFeeHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, FundingHistory, Quote } from "../../../../generated/schema"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"

export class ChargeAccumulatedFundingFeeHandler<T> extends CommonChargeAccumulatedFundingFeeHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		// Capture pre-update state before common handler modifies Quote
		let prevFundings: Array<BigInt> = []
		let openAmounts: Array<BigInt> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (quote) {
				prevFundings.push(quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero())
				openAmounts.push(quote.quantity!.minus(quote.closedAmount!))
			} else {
				prevFundings.push(BigInt.zero())
				openAmounts.push(BigInt.zero())
			}
		}

		super.handleQuote(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			let newFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
			let delta = newFunding.minus(prevFundings[i])
			let openAmount = openAmounts[i]

			let fundingPaid = BigInt.zero()
			let fundingReceived = BigInt.zero()
			if (delta.gt(BigInt.zero())) fundingPaid = delta
			else if (delta.lt(BigInt.zero())) fundingReceived = delta.abs()

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
			fundingHistory.fundingType = "CHARGE_ACCUMULATED_FUNDING_FEE"
			fundingHistory.rate = null
			fundingHistory.fundingPaid = fundingPaid
			fundingHistory.fundingReceived = fundingReceived
			fundingHistory.prevPrice = quote.openedPrice!
			fundingHistory.newPrice = quote.openedPrice!
			fundingHistory.openQuantity = openAmount
			fundingHistory.timestamp = event.block.timestamp
			fundingHistory.blockNumber = event.block.number
			fundingHistory.transaction = event.transaction.hash
			fundingHistory.save()
		}
	}
}
