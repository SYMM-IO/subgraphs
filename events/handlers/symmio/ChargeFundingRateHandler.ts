import { ChargeFundingRate as ChargeFundingRateEntity } from "../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { FACTOR, getGlobalCounterAndInc, unDecimal } from "../../../common/utils"
import { getQuote as getQuote_0_8_4 } from "../../../common/contract_utils_0_8_4"
import { getQuote as getQuote_0_8_3 } from "../../../common/contract_utils_0_8_3"
import { getQuote as getQuote_0_8_2 } from "../../../common/contract_utils_0_8_2"
import { getQuote as getQuote_0_8_0 } from "../../../common/contract_utils_0_8_0"

export class ChargeFundingRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new ChargeFundingRateEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.partyB = event.params.partyB
		entity.partyA = event.params.partyA
		entity.quoteIds = event.params.quoteIds
		entity.rates = event.params.rates
		let amounts: BigInt[] = []

		for (let i = 0; i < entity.quoteIds!.length; i++) {
			const quoteId: BigInt = entity.quoteIds![i]
			const rate: BigInt = entity.rates![i]

			switch (version) {
				case Version.v_0_8_4: {
					const chainQuote = getQuote_0_8_4(event.address, quoteId)
					if (chainQuote == null) return
					const updatedPrice = chainQuote.openedPrice
					// Reverse the rate application to get original price
					// If rate is 0.001 (0.1%), then original = current / 1.001
					const originalPrice = updatedPrice.times(FACTOR).div(rate.plus(FACTOR))
					const priceDiff = updatedPrice.minus(originalPrice)
					amounts.push(unDecimal(priceDiff.times(chainQuote.quantity)))
					break
				}
				case Version.v_0_8_3: {
					let chainQuote = getQuote_0_8_3(event.address, quoteId)!
					if (chainQuote == null) return
					const updatedPrice = chainQuote.openedPrice
					// Reverse the rate application to get original price
					// If rate is 0.001 (0.1%), then original = current / 1.001
					const originalPrice = updatedPrice.times(FACTOR).div(rate.plus(FACTOR))
					const priceDiff = updatedPrice.minus(originalPrice)
					amounts.push(unDecimal(priceDiff.times(chainQuote.quantity)))
					break
				}
				case Version.v_0_8_2: {
					let chainQuote = getQuote_0_8_2(event.address, quoteId)!
					if (chainQuote == null) return
					const updatedPrice = chainQuote.openedPrice
					// Reverse the rate application to get original price
					// If rate is 0.001 (0.1%), then original = current / 1.001
					const originalPrice = updatedPrice.times(FACTOR).div(rate.plus(FACTOR))
					const priceDiff = updatedPrice.minus(originalPrice)
					amounts.push(unDecimal(priceDiff.times(chainQuote.quantity)))
					break
				}
				case Version.v_0_8_0: {
					let chainQuote = getQuote_0_8_0(event.address, quoteId)!
					if (chainQuote == null) return
					amounts.push(BigInt.zero())
					break
				}
			}
		}
		entity.amounts = amounts
		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash
		entity.save()
	}
}
