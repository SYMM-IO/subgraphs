import {DeallocateForPartyB as DeallocateForPartyBEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DeallocateForPartyBHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new DeallocateForPartyBEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.partyB = event.params.partyB;
		entity.partyA = event.params.partyA;
		entity.amount = event.params.amount;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
