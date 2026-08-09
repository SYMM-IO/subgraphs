import { AddSymbol as AddSymbolEntity } from "../../../../generated/schema"
import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { getGlobalCounterAndInc } from "../../../common/utils"

export class AddSymbolHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new AddSymbolEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.counterId = getGlobalCounterAndInc()
		entity.source = event.address
		entity.transactionIndex = event.transaction.index
		entity.logIndex = event.logIndex
		entity.blockHash = event.block.hash

		entity.symbolId = _event.parameters[0].value.toBigInt()
		entity.maxLeverage = BigInt.zero()
		entity.fundingRateEpochDuration = BigInt.zero()
		entity.fundingRateWindowTime = BigInt.zero()
		if (_event.parameters.length >= 8) {
			entity.maxLeverage = _event.parameters[5].value.toBigInt()
			entity.fundingRateEpochDuration = _event.parameters[6].value.toBigInt()
			entity.fundingRateWindowTime = _event.parameters[7].value.toBigInt()
		}

		entity.name = event.params.name
		entity.minAcceptableQuoteValue = event.params.minAcceptableQuoteValue
		entity.minAcceptablePortionLF = event.params.minAcceptablePortionLF
		entity.tradingFee = event.params.tradingFee

		entity.blockTimestamp = event.block.timestamp
		entity.blockNumber = event.block.number
		entity.transactionHash = event.transaction.hash
		entity.save()
	}
}
