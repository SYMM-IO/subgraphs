import {LiquidatePositionsPartyB as LiquidatePositionsPartyBEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class LiquidatePositionsPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new LiquidatePositionsPartyBEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.liquidator = event.params.liquidator;
		entity.partyB = event.params.partyB;
		entity.partyA = event.params.partyA;
		entity.quoteIds = event.params.quoteIds;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
