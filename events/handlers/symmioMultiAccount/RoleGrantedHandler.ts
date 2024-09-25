import {RoleGranted as RoleGrantedEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {MultiAccountVersion} from "../../../common/BaseHandler";

export class RoleGrantedHandler<T> {
	handle(_event: ethereum.Event, version: MultiAccountVersion): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new RoleGrantedEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.role = event.params.role;
		entity.user = event.params.account;

		entity.blockTimestamp = event.block.timestamp;
		entity.blockNumber = event.block.number;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}