import { LiquidationFundingSettled as EventEntity } from "../../../../generated/schema"
import { ethereum } from "@graphprotocol/graph-ts"
import { Version } from "../../../common/BaseHandler"
import { setRawEventMetadata } from "./rawEvent"

export class LiquidationFundingSettledHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		const entity = new EventEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
		entity.partyA = event.params.partyA
		entity.partyB = event.params.partyB
		entity.allocationKey = event.params.allocationKey
		entity.rawFunding = event.params.rawFunding
		entity.settledFunding = event.params.settledFunding
		entity.rawPnl = event.params.rawPnl
		entity.settledPnl = event.params.settledPnl
		entity.scaleNumerator = event.params.scaleNumerator
		entity.scaleDenominator = event.params.scaleDenominator
		entity.liquidationId = event.params.liquidationId
		setRawEventMetadata(entity, _event)
		entity.save()
	}
}
