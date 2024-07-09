import {
	ChargeFundingRateHandler as CommonChargeFundingRateHandler
} from "../../../common/handlers/symmio/ChargeFundingRateHandler"
import {Account, GlobalFee, Quote} from "../../../generated/schema"
import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {getDailyHistoryForTimestamp, getTotalHistory, unDecimal} from "../../utils"
import {getQuote as getQuote_0_8_2} from "../../contract_utils_0_8_2"
import {getQuote as getQuote_0_8_0} from "../../contract_utils_0_8_0"
import {FACTOR} from "../../../common/utils"
import {Version} from "../../../common/BaseHandler";

export class ChargeFundingRateHandler<T> extends CommonChargeFundingRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		super.handle(_event, version)
		super.handleQuote(_event, version)
		super.handleSymbol(_event, version)
		super.handleAccount(_event, version)

		for (let i = 0, lenQ = event.params.quoteIds.length; i < lenQ; i++) {
			let quoteId = event.params.quoteIds[i]
			const rate = event.params.rates[i]
			let quote = Quote.load(quoteId.toString())!
			let account = Account.load(quote.partyA.toHexString())!
			const openAmount = quote.quantity!.minus(quote.closedAmount!)
			let funding: BigInt
			switch (version) {
				case Version.v_0_8_2: {
					let chainQuote = getQuote_0_8_2(event.address, BigInt.fromString(quote.id))!
					funding = unDecimal((chainQuote.openedPrice.minus(quote.openedPrice!).abs()).times(openAmount))
					break
				}
				case Version.v_0_8_0: {
					let chainQuote = getQuote_0_8_0(event.address, BigInt.fromString(quote.id))!
					funding = unDecimal((chainQuote.openedPrice.minus(quote.openedPrice!).abs()).times(openAmount))
					break
				}
			}
			const fee = quote.openedPrice!.times(rate).times(openAmount).div(FACTOR).div(FACTOR)

			let globalEntity = GlobalFee.load("GlobalEntity")
			if (!globalEntity) {
				globalEntity = new GlobalFee("GlobalEntity")
				globalEntity.globalFee = BigInt.fromI32(0)
			}
			globalEntity.latestTimestamp = event.block.timestamp
			globalEntity.globalFee = globalEntity.globalFee.plus(fee)
			globalEntity.save()

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
