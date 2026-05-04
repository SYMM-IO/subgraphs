import { BaseHandler, Version } from "../../../common/BaseHandler"
import { ethereum } from "@graphprotocol/graph-ts"
import { FundingRateSnapshot } from "../../../../generated/schema"
import { enrichFundingFeeState, getOrCreateFundingFeeState } from "../../utils/fundingFeeState"
import { createFundingIndexCheckpoint } from "../../utils/fundingHistory"

export class UpdateAccumulatedFundingFeeHandler<T> extends BaseHandler {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		for (let i = 0, len = event.params.symbolIds.length; i < len; i++) {
			let symbolId = event.params.symbolIds[i]
			let longRate = event.params.longRates[i]
			let shortRate = event.params.shortRates[i]
			let marketPrice = event.params.marketPrices[i]
			let partyB = event.params.partyB

			let snapshot = new FundingRateSnapshot(event.transaction.hash.toHex() + "-" + event.logIndex.toString() + "-" + i.toString())
			snapshot.source = event.address
			snapshot.symbolId = symbolId
			snapshot.partyB = partyB
			snapshot.longFee = longRate
			snapshot.shortFee = shortRate
			snapshot.marketPrice = marketPrice
			snapshot.eventType = "UPDATE"
			snapshot.timestamp = event.block.timestamp
			snapshot.blockNumber = event.block.number
			snapshot.transaction = event.transaction.hash
			snapshot.save()

			let state = getOrCreateFundingFeeState(_event, version, symbolId, partyB)
			state.currentLongRate = longRate
			state.currentShortRate = shortRate
			state.lastMarketPrice = marketPrice
			state.updateTimestamp = event.block.timestamp
			enrichFundingFeeState(state, event.address)
			state.save()
			createFundingIndexCheckpoint(_event, symbolId, partyB, "UPDATE", longRate, shortRate, marketPrice, state, i)
		}
	}
}
