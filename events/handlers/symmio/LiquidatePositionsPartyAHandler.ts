import {LiquidatePositionsPartyA as LiquidatePositionsPartyAEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LiquidatePositionsPartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePositionsPartyAEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.liquidator = event.params.liquidator;
		entity.partyA = event.params.partyA;
		entity.quoteIds = event.params.quoteIds;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
