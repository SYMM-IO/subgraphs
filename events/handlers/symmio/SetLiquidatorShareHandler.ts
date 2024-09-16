import {SetLiquidatorShare as SetLiquidatorShareEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetLiquidatorShareHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		
		let entity = new SetLiquidatorShareEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.oldLiquidatorShare = event.params.oldLiquidatorShare;
		entity.newLiquidatorShare = event.params.newLiquidatorShare;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
