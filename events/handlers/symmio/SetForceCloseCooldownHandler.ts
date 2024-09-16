import {SetForceCloseCooldown as SetForceCloseCooldownEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class SetForceCloseCooldownHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)
		
		let entity = new SetForceCloseCooldownEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.oldForceCloseCooldown = event.params.oldForceCloseCooldown;
		entity.newForceCloseCooldown = event.params.newForceCloseCooldown;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
