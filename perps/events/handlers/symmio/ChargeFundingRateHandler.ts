import { ChargeFundingRate as ChargeFundingRateEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { FACTOR, getGlobalCounterAndInc, unDecimal } from "../../../common/utils"
import { getQuote as getQuote_0_8_6 } from "../../../common/contract_utils_0_8_6"
import { getQuote as getQuote_0_8_5 } from "../../../common/contract_utils_0_8_5"
import { getQuote as getQuote_0_8_4 } from "../../../common/contract_utils_0_8_4"
import { getQuote as getQuote_0_8_3 } from "../../../common/contract_utils_0_8_3"
import { getQuote as getQuote_0_8_2 } from "../../../common/contract_utils_0_8_2"
import { getQuote as getQuote_0_8_1 } from "../../../common/contract_utils_0_8_1"

function calculateFundingAmount(updatedPrice: BigInt, quantity: BigInt, closedAmount: BigInt, positionType: i32, rate: BigInt): BigInt {
	// LONG prices move by (1 + rate); SHORT prices move by (1 - rate).
	const denominator = positionType == 0 ? FACTOR.plus(rate) : FACTOR.minus(rate)
	if (denominator.le(BigInt.zero())) return BigInt.zero()

	const originalPrice = updatedPrice.times(FACTOR).div(denominator)
	const priceDelta = updatedPrice.minus(originalPrice).abs()
	const openAmount = quantity.minus(closedAmount)
	return unDecimal(priceDelta.times(openAmount))
}

export class ChargeFundingRateHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new ChargeFundingRateEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.partyB = event.params.partyB
		entity.partyA = event.params.partyA
		entity.quoteIds = event.params.quoteIds
		entity.rates = event.params.rates
		let amounts: BigInt[] = []

		for (let i = 0; i < entity.quoteIds!.length; i++) {
			const quoteId: BigInt = entity.quoteIds![i]
			const rate: BigInt = entity.rates![i]

			switch (version) {
				case Version.v_0_8_6: {
					const chainQuote = getQuote_0_8_6(event.address, quoteId)
					if (chainQuote == null) {
						amounts.push(BigInt.zero())
						break
					}
					amounts.push(calculateFundingAmount(chainQuote.openedPrice, chainQuote.quantity, chainQuote.closedAmount, chainQuote.positionType, rate))
					break
				}
				case Version.v_0_8_5: {
					const chainQuote = getQuote_0_8_5(event.address, quoteId)
					if (chainQuote == null) {
						amounts.push(BigInt.zero())
						break
					}
					amounts.push(calculateFundingAmount(chainQuote.openedPrice, chainQuote.quantity, chainQuote.closedAmount, chainQuote.positionType, rate))
					break
				}
				case Version.v_0_8_4: {
					const chainQuote = getQuote_0_8_4(event.address, quoteId)
					if (chainQuote == null) {
						amounts.push(BigInt.zero())
						break
					}
					amounts.push(calculateFundingAmount(chainQuote.openedPrice, chainQuote.quantity, chainQuote.closedAmount, chainQuote.positionType, rate))
					break
				}
				case Version.v_0_8_3: {
					const chainQuote = getQuote_0_8_3(event.address, quoteId)
					if (chainQuote == null) {
						amounts.push(BigInt.zero())
						break
					}
					amounts.push(calculateFundingAmount(chainQuote.openedPrice, chainQuote.quantity, chainQuote.closedAmount, chainQuote.positionType, rate))
					break
				}
				case Version.v_0_8_2: {
					const chainQuote = getQuote_0_8_2(event.address, quoteId)
					if (chainQuote == null) {
						amounts.push(BigInt.zero())
						break
					}
					amounts.push(calculateFundingAmount(chainQuote.openedPrice, chainQuote.quantity, chainQuote.closedAmount, chainQuote.positionType, rate))
					break
				}
				case Version.v_0_8_1: {
					const chainQuote = getQuote_0_8_1(event.address, quoteId)
					if (chainQuote == null) {
						amounts.push(BigInt.zero())
						break
					}
					amounts.push(calculateFundingAmount(chainQuote.openedPrice, chainQuote.quantity, chainQuote.closedAmount, chainQuote.positionType, rate))
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
