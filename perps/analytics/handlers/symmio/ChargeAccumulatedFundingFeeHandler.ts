import { ChargeAccumulatedFundingFeeHandler as CommonChargeAccumulatedFundingFeeHandler } from "../../../common/handlers/symmio/ChargeAccumulatedFundingFeeHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { BigInt } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { Account, Quote } from "../../../../generated/schema"

import { updateHistories, UpdateHistoriesParams } from "../../utils/historyHelpers"
import { unDecimal } from "../../utils/common"
import { createQuoteEvent, JSONBuilder } from "../../utils/quoteEvent"
import { updatePartyALatestBalance, updatePartyBLatestBalance } from "../../utils/latestAccountBalance"
import { onFundingUpdate } from "../../utils/aggregatedPosition"
import { syncFundingFeeState } from "../../utils/fundingFeeState"

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

		let seenFundingStates: Array<string> = []
		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			let quote = Quote.load(quoteId.toString() + "-" + event.address.toHexString())
			if (!quote) continue

			let newFunding = quote.accumulatedPaidFunding ? quote.accumulatedPaidFunding! : BigInt.zero()
			let delta = newFunding.minus(prevFundings[i])
			let openAmount = openAmounts[i]
			let fundingAmount = unDecimal(delta.abs().times(openAmount))

			onFundingUpdate(
				_event,
				version,
				event.params.partyA,
				event.params.partyB,
				quote.symbolId!,
				quote.positionType,
				openAmount,
				prevFundings[i],
				newFunding,
			)

			let fundingPaid = BigInt.zero()
			let fundingReceived = BigInt.zero()
			if (delta.gt(BigInt.zero())) fundingPaid = fundingAmount
			else if (delta.lt(BigInt.zero())) fundingReceived = fundingAmount

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
				"CHARGE_ACCUMULATED_FUNDING_FEE",
					new JSONBuilder()
						.add("fundingPaid", fundingPaid.toString())
						.add("fundingReceived", fundingReceived.toString())
						.add("prevFunding", prevFundings[i].toString())
						.add("newFunding", newFunding.toString())
						.add("fundingDelta", delta.toString())
						.add("prevPrice", quote.openedPrice!.toString())
						.add("newPrice", quote.openedPrice!.toString())
						.add("openQuantity", openAmount.toString())
						.build(),
			)

			let fundingStateKey = quote.symbolId!.toString() + "-" + event.params.partyB.toHexString()
			if (!seenFundingStates.includes(fundingStateKey)) {
				seenFundingStates.push(fundingStateKey)
				syncFundingFeeState(_event, version, quote.symbolId!, event.params.partyB)
			}
		}
		updatePartyALatestBalance(_event, version, event.params.partyA)
		updatePartyBLatestBalance(_event, version, event.params.partyB, event.params.partyA)
	}
}
