import {SetForceCancelCooldown as SetForceCancelCooldownEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetForceCancelCooldownHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		
		let entity = new SetForceCancelCooldownEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.oldForceCancelCooldown = event.params.oldForceCancelCooldown;
		entity.newForceCancelCooldown = event.params.newForceCancelCooldown;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
