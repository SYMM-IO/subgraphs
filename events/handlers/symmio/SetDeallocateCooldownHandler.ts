import {SetDeallocateCooldown as SetDeallocateCooldownEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetDeallocateCooldownHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new SetDeallocateCooldownEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.oldDeallocateCooldown = event.params.oldDeallocateCooldown;
		entity.newDeallocateCooldown = event.params.newDeallocateCooldown;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
