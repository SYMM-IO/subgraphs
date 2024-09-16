import {Deposit as DepositEntity} from "../../../generated/schema";
import {ethereum} from "@graphprotocol/graph-ts";
import {Version} from "../../../common/BaseHandler";

export class DepositHandler<T>  {
	handle(_event: ethereum.Event, version: Version): void {
		// @ts-ignore
		const event = changetype<T>(_event)

		let entity = new DepositEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
		entity.sender = event.params.sender;
		entity.user = event.params.user;
		entity.amount = event.params.amount;

		entity.blockTimestamp = event.block.timestamp;
		entity.transactionHash = event.transaction.hash;
		entity.save();
	}
}
