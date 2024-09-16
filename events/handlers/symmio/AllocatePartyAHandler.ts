import {AllocatePartyA as AllocatePartyAEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class AllocatePartyAHandler<T> {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new AllocatePartyAEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.user = event.params.user;
		entity.amount = event.params.amount;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
