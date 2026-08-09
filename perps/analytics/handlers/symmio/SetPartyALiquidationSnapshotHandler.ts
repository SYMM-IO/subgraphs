import { ethereum, log } from "@graphprotocol/graph-ts"
import { PartyALiquidationFundingSnapshot } from "../../../../generated/schema"
import { Version } from "../../../common/BaseHandler"

export class SetPartyALiquidationSnapshotHandler<T> {
	handle(_event: ethereum.Event, _version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		let length = event.params.partyBs.length
		if (
			event.params.symbolIds.length != length ||
			event.params.prices.length != length ||
			event.params.cumulativeLongFees.length != length ||
			event.params.cumulativeShortFees.length != length
		) {
			log.error("Invalid PartyA liquidation snapshot array lengths for liquidation {}", [event.params.liquidationId.toHexString()])
			return
		}

		for (let i = 0; i < length; i++) {
			let id =
				event.address.toHexString() +
				"-" +
				event.params.partyA.toHexString() +
				"-" +
				event.params.liquidationId.toHexString() +
				"-" +
				event.params.partyBs[i].toHexString() +
				"-" +
				event.params.symbolIds[i].toString()
			let entity = PartyALiquidationFundingSnapshot.load(id)
			if (!entity) entity = new PartyALiquidationFundingSnapshot(id)
			entity.source = event.address
			entity.partyA = event.params.partyA
			entity.liquidationId = event.params.liquidationId
			entity.partyB = event.params.partyBs[i]
			entity.symbolId = event.params.symbolIds[i]
			entity.price = event.params.prices[i]
			entity.cumulativeLongFee = event.params.cumulativeLongFees[i]
			entity.cumulativeShortFee = event.params.cumulativeShortFees[i]
			entity.timestamp = event.block.timestamp
			entity.blockNumber = event.block.number
			entity.transaction = event.transaction.hash
			entity.save()
		}
	}
}
